import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AppError, redisService, transporter } from "../../../classes";
import { MediaModule, UserModule } from "../..";

import { generateOtp, generateOtpToken } from "../utils";
import { OTP_EXPIRY } from "../../../constants";
import { generateToken } from "../services";

export const registerSendOtpController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.query ?? {};
  const otp = generateOtp();
  const otpToken = generateOtpToken();

  // Store OTP in Redis with 10 mins expiration
  await redisService
    .getClient()
    ?.setEx(`register_otp:${otpToken}`, OTP_EXPIRY, otp);

  await transporter.sendOtpEmail(String(email), otp);

  res.success(200, "OTP sent successfully", { otpToken });
};

export const registerVerifyOtpController = async (
  req: Request,
  res: Response
) => {
  const { firstName, lastName, email, password, phoneNumber, otp } =
    req.body ?? {};

  const { otpToken } = req.query ?? {};

  let [user, existingPhoneUser] = await Promise.all([
    UserModule.Services.getUserByEmail(email, false),
    UserModule.Services.getUserByPhoneNumber(phoneNumber, true),
  ]);

  const isPhoneNumberExists =
    existingPhoneUser &&
    existingPhoneUser._id.toString() !== user?._id.toString();

  if (isPhoneNumberExists) {
    throw new AppError("Phone number already exists", 400);
  }

  const storedOtp = await redisService
    .getClient()
    ?.get(`register_otp:${otpToken}`);

  if (!storedOtp) throw new AppError("OTP expired or invalid", 400);

  if (storedOtp !== otp) throw new AppError("Invalid OTP", 400);

  console.log("OTP");
  console.log("storedOtp", storedOtp);

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
    await redisService.getClient()?.del(`register_otp:${otpToken}`);

    const { password: _, ...restUser } = user?.toObject();

    const token = generateToken(user._id);

    res.success(201, "User registered successfully", { token, user: restUser });
  } catch (error) {
    if (profilePic)
      await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError("Failed to register user", 500);
  }
};
