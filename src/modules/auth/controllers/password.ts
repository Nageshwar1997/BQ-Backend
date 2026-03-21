import { Request, Response } from "express";
import { AuthModule, UserModule } from "../..";
import { AppError, mailService, redisService } from "../../../classes";
import { generateTokenForRedis } from "../utils";
import { MINUTE } from "../../../constants";
import { getFrontendURL, STRINGIFY_DATA } from "../../../utils";

export const forgotPasswordSendLinkAndOtpController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body ?? {};

  const user = await UserModule.Services.getUserByEmail(email, true);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.providers.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError(
      `This account was created using an OAuth (${user.providers.join(
        " / ",
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", ",
      )}).`,
      400,
    );
  }

  const token = generateTokenForRedis(32);
  const otp = AuthModule.Utils.generateOtp();

  await redisService.getClient()?.setEx(
    `forgotPassword:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({
      userId: user._id,
      sendCount: 1,
      otp,
    }),
  );

  const redirectUrl = `${getFrontendURL(
    user.role,
  )}/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: redirectUrl,
    otp,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "Forgot password link sent successfully on your email", {
    token,
  });
};

export const forgotPasswordVerifyOtpController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body ?? {};

  const user = await UserModule.Services.getUserByEmail(email, true);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.providers.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError(
      `This account was created using an OAuth (${user.providers.join(
        " / ",
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", ",
      )}).`,
      400,
    );
  }

  const token = generateTokenForRedis(32);
  const otp = AuthModule.Utils.generateOtp();

  await redisService.getClient()?.setEx(
    `forgotPassword:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({
      userId: user._id,
      sendCount: 1,
      otp,
    }),
  );

  const redirectUrl = `${getFrontendURL(
    user.role,
  )}/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: redirectUrl,
    otp,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "Forgot password link sent successfully on your email", {
    token,
  });
};
