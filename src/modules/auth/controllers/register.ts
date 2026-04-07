import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AppError } from "../../../classes";
import { MediaModule, UserModule } from "../..";

import { authUtils } from "../utils";
import { constants } from "../../../constants";
import { authServices } from "../services";
import {
  getAuthorizationToken,
  PARSE_DATA,
  STRINGIFY_DATA,
} from "../../../utils";
import { services } from "../../../services";

// -------------------- Send OTP --------------------
export const registerSendOtpController = async (
  req: Request,
  res: Response,
) => {
  let { email } = req.body ?? {};

  const user = await UserModule.Services.getUserByEmail(email, true);

  if (user && user.providers.includes("MANUAL")) {
    throw new AppError({
      message: "User already exists, please login",
      statusCode: 400,
      code: "AUTH_ERROR",
      fieldErrors: { email: ["Email already exists"] },
    });
  }

  const otp = authUtils.generateOtp();
  const otpToken = authUtils.generateTokenForRedis(20);

  // Store OTP + email + sendCount in Redis
  await services.redis
    .getClient()
    ?.setEx(
      `register_data:${otpToken}`,
      constants.common.OTP_EXPIRY,
      STRINGIFY_DATA({ otp, email, sendCount: 1 }),
    );

  const { message, success } = await services.mail.sendOtp({ to: email, otp });

  if (!success) {
    throw new AppError({ message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(200, "OTP sent successfully", { otpToken, sendCount: 1 });
};

// -------------------- Resend OTP --------------------
export const registerResendOtpController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body ?? {};

  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({
      message: "Authorization token is required",
      statusCode: 401,
      code: "AUTH_ERROR",
    });
  }

  const otpToken = getAuthorizationToken(rawToken);

  if (!otpToken)
    throw new AppError({ message: "OTP token is required", statusCode: 400 });

  const storedData = await services.redis
    .getClient()
    ?.get(`register_data:${otpToken}`);

  if (!storedData)
    throw new AppError({
      message: "OTP session expired or invalid",
      statusCode: 410,
      code: "AUTH_ERROR",
    }); // NOTE - Don't change message anyway, In frontend we handled logic base on message

  const parsedData = PARSE_DATA(storedData);
  if (!parsedData.otp || !parsedData.email) {
    throw new AppError({
      message: "Invalid OTP session data",
      statusCode: 400,
      code: "AUTH_ERROR",
    });
  }

  if (parsedData.email !== email) {
    throw new AppError({
      message: "OTP session expired or invalid",
      statusCode: 410,
      code: "AUTH_ERROR",
    }); // NOTE - Don't change message anyway, In frontend we handled logic base on message
  }

  // Increment sendCount and check limit
  const sendCount = (parsedData.sendCount ?? 1) + 1;
  if (sendCount > constants.common.MAX_RESEND)
    throw new AppError({
      message: "Maximum resend attempts reached",
      statusCode: 410,
      code: "AUTH_ERROR",
    }); // NOTE - Don't change message anyway, In frontend we handled logic base on message

  // Generate new OTP
  const newOtp = authUtils.generateOtp();

  // Update Redis
  await services.redis
    .getClient()
    ?.setEx(
      `register_data:${otpToken}`,
      constants.common.OTP_EXPIRY,
      STRINGIFY_DATA({ ...parsedData, otp: newOtp, sendCount }),
    );

  // Send email
  const { message, success } = await services.mail.sendOtp({
    to: parsedData.email,
    otp: newOtp,
  });

  if (!success) {
    throw new AppError({ message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(
    200,
    `OTP resent successfully (${sendCount}/${constants.common.MAX_RESEND})`,
  );
};

// -------------------- Verify OTP --------------------
export const registerVerifyOtpController = async (
  req: Request,
  res: Response,
) => {
  const { firstName, lastName, email, password, phoneNumber, otp } =
    req.body ?? {};

  const { otpToken } = req.query ?? {};

  if (!otpToken)
    throw new AppError({ message: "OTP token is required", statusCode: 400 });

  // Check Redis for stored OTP
  const storedData = await services.redis
    .getClient()
    ?.get(`register_data:${otpToken}`);
  if (!storedData)
    throw new AppError({ message: "OTP expired or invalid", statusCode: 400 });

  const parsedData = PARSE_DATA(storedData);

  if (parsedData.otp !== otp)
    throw new AppError({ message: "Invalid OTP", statusCode: 400 });

  if (parsedData.email !== email)
    throw new AppError({ message: "Invalid email", statusCode: 400 });

  // Check for existing users
  let [user, existingPhoneUser] = await Promise.all([
    UserModule.Services.getUserByEmail(email, false),
    UserModule.Services.getUserByPhoneNumber(phoneNumber, true),
  ]);

  if (
    existingPhoneUser &&
    existingPhoneUser._id.toString() !== user?._id.toString()
  ) {
    throw new AppError({
      message: "Phone number already exists",
      statusCode: 400,
    });
  }

  // Profile picture upload
  const file = req.file;
  let profilePic = "";
  if (file) {
    const imageResult = await MediaModule.Utils.singleImageUploader({
      file,
      folder: "Profile_Pictures",
      cloudinaryConfigOption: "image",
    });
    profilePic = imageResult?.secure_url ?? "";
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (user) {
      // User exists → oAuth-only
      if (!user.providers.includes("MANUAL")) {
        user.password = hashedPassword;
        user.providers.push("MANUAL");
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        if (profilePic) user.profilePic = profilePic;
        await user.save();
      } else {
        throw new AppError({
          message: "Email already exists",
          statusCode: 400,
        });
      }
    } else {
      // Completely new user → create
      user = await UserModule.models.User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        profilePic,
        providers: ["MANUAL"],
      });
    }

    // Delete OTP from Redis
    await services.redis.getClient()?.del(`register_data:${otpToken}`);

    const { password: _, ...restUser } = user?.toObject();

    await services.redis.setCachedUser(restUser);

    const token = authServices.generateToken(user._id);

    res.success(201, "User registered successfully", { token, user: restUser });
  } catch (error) {
    if (profilePic)
      await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError({
      message: "Failed to register user",
      statusCode: 500,
      code: "INTERNAL_ERROR",
    });
  }
};
