import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AuthModule, UserModule } from "../..";
import { AppError, mailService, redisService } from "../../../classes";
import { generateTokenForRedis } from "../utils";
import { MAX_RESEND, MINUTE } from "../../../constants";
import {
  getAuthorizationToken,
  getFrontendURL,
  PARSE_DATA,
  STRINGIFY_DATA,
} from "../../../utils";
import { TAuthProvider } from "../../user/types";
import { generateToken } from "../services";

const checkManuallyLoggedIn = (providers: TAuthProvider[]) => {
  if (!providers?.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError({
      message: `This account was created using an OAuth (${providers.join(
        " / ",
      )}) login. Please login using your provider (e.g., ${providers.join(
        ", ",
      )}).`,
      statusCode: 400,
    });
  }
}

export const forgotPasswordSendLinkAndOtpController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body ?? {};

  if (!email) {
    throw new AppError({ message: "Email is required", statusCode: 400 });
  }

  const user = await UserModule.Services.getUserByEmail(email, true);

  if (!user) {
    throw new AppError({ message: "No account found with this email", statusCode: 404, code: "NOT_FOUND" });
  }

  checkManuallyLoggedIn(user.providers);

  const token = generateTokenForRedis(32);
  const otp = AuthModule.Utils.generateOtp();

  await redisService.getClient()?.setEx(
    `forgot-password:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({
      userId: user._id,
      sendCount: 1,
      otp,
      verified: false,
    }),
  );

  const redirectUrl = `${getFrontendURL(
    user.role,
  )}/auth/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: redirectUrl,
    otp,
  });

  if (!success) {
    throw new AppError({ message: message || "Failed to send OTP email. Please try again.", statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(200, "OTP and reset link sent to your email", { token });
};

export const forgotPasswordResendLinkAndOtpController = async (
  req: Request,
  res: Response,
) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Authorization token is required", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) {
    throw new AppError({ message: "Session expired. Please request a new OTP.", statusCode: 400 });
  }

  const parsedData = PARSE_DATA(redisData);

  const sendCount = (parsedData?.sendCount ?? 1) + 1;

  if (sendCount > MAX_RESEND) {
    throw new AppError({
      message: "Maximum resend attempts reached. Please try again later.",
      statusCode: 400,
    });
  }

  const user = await UserModule.Services.getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  checkManuallyLoggedIn(user.providers);

  const otp = AuthModule.Utils.generateOtp();

  await redisService.getClient()?.setEx(
    `forgot-password:${token}`,
    MINUTE * MINUTE,
    STRINGIFY_DATA({
      userId: parsedData.userId,
      sendCount,
      otp,
      verified: false,
    }),
  );

  const { success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: `${getFrontendURL(user.role)}/auth/forgot-password?token=${token}`,
    otp,
  });

  if (!success) {
    throw new AppError({ message: "Failed to resend OTP. Please try again.", statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(200, "OTP resent successfully", { sendCount });
};

export const forgotPasswordVerifyOtpController = async (
  req: Request,
  res: Response,
) => {
  const { otp } = req.body ?? {};

  if (!otp) {
    throw new AppError({ message: "OTP is required", statusCode: 400 });
  }

  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Authorization token is required", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) {
    throw new AppError({ message: "Session expired. Please request a new OTP.", statusCode: 400 });
  }

  const parsedData = PARSE_DATA(redisData);

  if (!parsedData.otp) {
    throw new AppError({ message: "OTP not found. Please request a new one.", statusCode: 400 });
  }

  if (parsedData.otp !== otp) {
    throw new AppError({ message: "Invalid OTP. Please try again.", statusCode: 400 });
  }

  await redisService.getClient()?.setEx(
    `forgot-password:${token}`,
    MINUTE * MINUTE,
    STRINGIFY_DATA({
      ...parsedData,
      verified: true,
      otp: null, // optional cleanup
    }),
  );

  res.success(200, "OTP verified successfully", { verified: true });
};

export const validateTokenForForgotPasswordController = async (req: Request, res: Response) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Authorization token is required", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);
  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) {
    throw new AppError({ message: "Session expired. Please request a new OTP.", statusCode: 400 });
  }

  res.success(200, "Token is valid", { valid: true });
}

export const setForgotPasswordController = async (
  req: Request,
  res: Response,
) => {
  const { password } = req.body ?? {};

  if (!password) {
    throw new AppError({ message: "Password is required", statusCode: 400 });
  }

  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Authorization token is required", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) {
    throw new AppError({ message: "Session expired. Please restart the process.", statusCode: 400 });
  }

  const parsedData = PARSE_DATA(redisData);

  if (!parsedData.verified) {
    throw new AppError({
      message: "OTP verification required before setting password",
      statusCode: 400,
    });
  }

  const user = await UserModule.Services.getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  if (!user) {
    throw new AppError({ message: "User not found", statusCode: 404, code: "NOT_FOUND" });
  }

  checkManuallyLoggedIn(user.providers);

  const hashedPassword = await bcrypt.hash(password, 10);
  await user.updateOne({ password: hashedPassword });

  await redisService.getClient()?.del(`forgot-password:${token}`);

  const userToken = generateToken(user._id);

  const { password: _, ...restUser } = user?.toObject() ?? {};

  await redisService.setCachedUser(user);

  res.success(
    200,
    "Password updated successfully and you are now logged in.",
    { user: restUser, token: userToken }
  );
};
