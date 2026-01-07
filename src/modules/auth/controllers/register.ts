import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AppError, mailService, redisService } from "../../../classes";
import { MediaModule, UserModule } from "../..";

import { generateOtp, generateTokenForRedis } from "../utils";
import { MAX_RESEND, OTP_EXPIRY } from "../../../constants";
import { generateToken } from "../services";
import { PARSE_DATA, STRINGIFY_DATA } from "../../../utils";

// -------------------- Send OTP --------------------
export const registerSendOtpController = async (
  req: Request,
  res: Response
) => {
  let { email } = req.query ?? {};

  email = email?.toString()?.trim()?.toLowerCase();

  if (!email) throw new AppError("Email is required", 400);

  const user = await UserModule.Services.getUserByEmail(email, true);

  if (user && user.providers.includes("MANUAL")) {
    throw new AppError("User already exists, please login", 400);
  }

  const otp = generateOtp();
  const otpToken = generateTokenForRedis(20);

  // Store OTP + email + sendCount in Redis
  await redisService
    .getClient()
    ?.setEx(
      `register_data:${otpToken}`,
      OTP_EXPIRY,
      STRINGIFY_DATA({ otp, email, sendCount: 1 })
    );

  const { message, success } = await mailService.sendOtp({ to: email, otp });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "OTP sent successfully", { otpToken, sendCount: 1 });
};

// -------------------- Resend OTP --------------------
export const registerResendOtpController = async (
  req: Request,
  res: Response
) => {
  let { otpToken, email } = req.query ?? {};

  email = email?.toString()?.trim()?.toLowerCase();

  if (!otpToken) throw new AppError("OTP token is required", 400);

  const storedData = await redisService
    .getClient()
    ?.get(`register_data:${otpToken}`);

  if (!storedData)
    throw new AppError("OTP session expired or invalid Go Back", 400); // NOTE - Don't change message anyway, In frontend we handled logic base on message

  const parsedData = PARSE_DATA(storedData);
  if (!parsedData.otp || !parsedData.email) {
    throw new AppError("Invalid OTP session data", 400);
  }

  if (parsedData.email !== email) {
    throw new AppError("OTP session expired or invalid Go Back", 400); // NOTE - Don't change message anyway, In frontend we handled logic base on message
  }

  // Increment sendCount and check limit
  const sendCount = (parsedData.sendCount ?? 1) + 1;
  if (sendCount > MAX_RESEND)
    throw new AppError("Maximum resend attempts reached Go Back", 400); // NOTE - Don't change message anyway, In frontend we handled logic base on message

  // Generate new OTP
  const newOtp = generateOtp();

  // Update Redis
  await redisService
    .getClient()
    ?.setEx(
      `register_data:${otpToken}`,
      OTP_EXPIRY,
      STRINGIFY_DATA({ ...parsedData, otp: newOtp, sendCount })
    );

  // Send email
  const { message, success } = await mailService.sendOtp({
    to: parsedData.email,
    otp: newOtp,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, `OTP resent successfully (${sendCount}/${MAX_RESEND})`);
};

// -------------------- Verify OTP --------------------
export const registerVerifyOtpController = async (
  req: Request,
  res: Response
) => {
  const { firstName, lastName, email, password, phoneNumber, otp } =
    req.body ?? {};

  const { otpToken } = req.query ?? {};

  if (!otpToken) throw new AppError("OTP token is required", 400);

  // Check Redis for stored OTP
  const storedData = await redisService
    .getClient()
    ?.get(`register_data:${otpToken}`);
  if (!storedData) throw new AppError("OTP expired or invalid", 400);

  const parsedData = PARSE_DATA(storedData);

  if (parsedData.otp !== otp) throw new AppError("Invalid OTP", 400);

  if (parsedData.email !== email) throw new AppError("Invalid email", 400);

  // Check for existing users
  let [user, existingPhoneUser] = await Promise.all([
    UserModule.Services.getUserByEmail(email, false),
    UserModule.Services.getUserByPhoneNumber(phoneNumber, true),
  ]);

  if (
    existingPhoneUser &&
    existingPhoneUser._id.toString() !== user?._id.toString()
  ) {
    throw new AppError("Phone number already exists", 400);
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
      // User exists → OAuth-only
      if (!user.providers.includes("MANUAL")) {
        user.password = hashedPassword;
        user.providers.push("MANUAL");
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        if (profilePic) user.profilePic = profilePic;
        await user.save();
      } else {
        throw new AppError("Email already exists", 400);
      }
    } else {
      // Completely new user → create
      user = await UserModule.Models.User.create({
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
    await redisService.getClient()?.del(`register_data:${otpToken}`);

    const { password: _, ...restUser } = user?.toObject();

    const token = generateToken(user._id);

    res.success(201, "User registered successfully", { token, user: restUser });
  } catch (error) {
    if (profilePic)
      await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError("Failed to register user", 500);
  }
};
