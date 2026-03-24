import { Request, Response } from "express";
import { AuthModule, UserModule } from "../..";
import { AppError, mailService, redisService } from "../../../classes";
import { generateTokenForRedis } from "../utils";
import { MAX_RESEND, MINUTE } from "../../../constants";
import { getAuthorizationToken, getFrontendURL, PARSE_DATA, STRINGIFY_DATA } from "../../../utils";

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
    `forgot-password:${token}`,
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

  res.success(200, "Forgot password link and otp sent successfully on your email", {
    token,
  });
};

export const forgotPasswordResendLinkAndOtpController = async (
  req: Request,
  res: Response,
) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError("Link token is required", 401);
  }

  const token = getAuthorizationToken(rawToken);

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) throw new AppError("Link & OTP expired or invalid", 400);

  const parsedData: { sendCount: number; userId: string } =
    PARSE_DATA(redisData);

  // Increment sendCount and check limit
  const sendCount = (parsedData?.sendCount ?? 1) + 1;
  if (sendCount > MAX_RESEND) {
    throw new AppError("Maximum resend attempts reached, try again later", 400);
  }

  const user = await UserModule.Services.getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  if (!user?.providers?.includes("MANUAL")) {
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

  await redisService.getClient()?.setEx(
    `forgot-password:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({ userId: user._id, sendCount }),
  );

  const redirectUrl = `${getFrontendURL(
    user.role,
  )}/forgot-password?token=${token}`;

  const otp = AuthModule.Utils.generateOtp();

  const { message, success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: redirectUrl,
    otp,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "Forgot password link and otp resent successfully on your email", {
    sendCount,
  });
};


export const forgotPasswordVerifyOtpController = async (
  req: Request,
  res: Response,
) => {
  const { otp } = req.body ?? {};


  if (!otp) {
    throw new AppError("OTP is required", 400);
  }

  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError("Link and OTP token is required", 401);
  }

  const token = getAuthorizationToken(rawToken);

  if (!token) throw new AppError("Link and OTP token is required", 400);

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) throw new AppError("Link & OTP expired or invalid", 400);

  const parsedData = PARSE_DATA(redisData);

  if (!parsedData.otp) {
    throw new AppError("OTP not found for this token", 400);
  }


  if (parsedData.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }



  res.success(200, "OTP verified successfully", { verified: true });
};
