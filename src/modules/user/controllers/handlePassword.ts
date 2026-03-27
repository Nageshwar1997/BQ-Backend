import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { getUserByEmail, getUserById, updateUser } from "../services";
import { TAuthProvider } from "../types";
import { AppError, mailService, redisService } from "../../../classes";
import { generateTokenForRedis } from "../../auth/utils";
import { MAX_RESEND, MINUTE } from "../../../constants";
import {
  getAuthorizationToken,
  getFrontendURL,
  PARSE_DATA,
  STRINGIFY_DATA,
} from "../../../utils";


export const changePasswordController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = req.user;
  const { oldPassword, password } = req.body;

  if (user?.password === password || password === oldPassword) {
    throw new AppError({
      message: "New password must be different from current password.",
      statusCode: 400,
    });
  }
  const isPasswordMatch = bcrypt.compareSync(oldPassword, user?.password || "");

  if (!isPasswordMatch) {
    throw new AppError({ message: "Old password is incorrect", statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await updateUser(user?._id, { password: hashedPassword });

  const { password: _, ...restUser } = updatedUser?.toObject() ?? {};

  res.success(200, "Password changed successfully", { user: restUser });
};

export const updatePasswordController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = req.user;
  const { password } = req.body;

  if (user?.password === password) {
    throw new AppError({
      message: "New password must be different from current password.",
      statusCode: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedProviders: Set<TAuthProvider> = new Set([
    ...(user?.providers ?? []),
    "MANUAL",
  ]);

  const updatedUser = await updateUser(user?._id, {
    password: hashedPassword,
    providers: Array.from(updatedProviders),
  });

  const { password: _, ...restUser } = updatedUser?.toObject() ?? {};

  res.success(200, "Password updated successfully", { user: restUser });
};

export const resetPasswordSendLinkController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = req.user!;

  const resetToken = generateTokenForRedis(32);

  await redisService.getClient()?.setEx(
    `resetPassword:${resetToken}`,
    MINUTE * MINUTE, // 1 hour in seconds
    user._id.toString(),
  );

  // 3️⃣ Create password reset URL
  const resetUrl = `${getFrontendURL(
    user.role,
  )}/reset-password?token=${resetToken}`;

  const { message, success } = await mailService.sendPasswordResetLink({
    to: user.email,
    resetLink: resetUrl,
  });

  if (!success) {
    throw new AppError({ message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(200, "Password reset link sent successfully");
};

export const validResetPasswordTokenController = async (
  req: Request,
  res: Response,
) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Reset token missing", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  const redisKey = `resetPassword:${token}`;
  const userId = await redisService.getClient()?.get(redisKey);

  if (!userId) {
    throw new AppError({ message: "Reset link is invalid or has expired", statusCode: 400 });
  }

  res.success(200, "Token is valid");
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Reset token missing", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  const redisKey = `resetPassword:${token}`;
  const userId = await redisService.getClient()?.get(redisKey);

  if (!userId) {
    throw new AppError({ message: "Reset link is invalid or has expired", statusCode: 400 });
  }

  const { password } = req.body ?? {};

  const hashedPassword = await bcrypt.hash(password, 10);

  await updateUser(userId, {
    password: hashedPassword,
  });

  await redisService.getClient()?.del(redisKey);

  res.success(200, "Password reset successfully");
};

export const forgotPasswordSendLinkController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body ?? {};

  const user = await getUserByEmail(email, true);

  if (!user) {
    throw new AppError({ message: "User not found", statusCode: 404, code: "NOT_FOUND" });
  }

  if (!user.providers.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError({
      message: `This account was created using an OAuth (${user.providers.join(
        " / ",
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", ",
      )}).`,
      statusCode: 400,
    });
  }

  const token = generateTokenForRedis(32);

  await redisService.getClient()?.setEx(
    `forgot-password:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({
      userId: user._id,
      sendCount: 1,
    }),
  );

  const redirectUrl = `${getFrontendURL(
    user.role,
  )}/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: redirectUrl,
    otp: "123",
  });

  if (!success) {
    throw new AppError({ message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(200, "Forgot password link sent successfully on your email", {
    token,
  });
};

export const forgotPasswordResendLinkController = async (
  req: Request,
  res: Response,
) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Link token is required", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) throw new AppError({ message: "Link expired or invalid", statusCode: 400 });

  const parsedData: { sendCount: number; userId: string } =
    PARSE_DATA(redisData);

  // Increment sendCount and check limit
  const sendCount = (parsedData?.sendCount ?? 1) + 1;
  if (sendCount > MAX_RESEND) {
    throw new AppError({ message: "Maximum resend attempts reached, try again later", statusCode: 400 });
  }

  const user = await getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  if (!user?.providers?.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError({
      message: `This account was created using an OAuth (${user.providers.join(
        " / ",
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", ",
      )}).`,
      statusCode: 400,
    });
  }

  await redisService.getClient()?.setEx(
    `forgot-password:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({ userId: user._id, sendCount }),
  );

  const redirectUrl = `${getFrontendURL(
    user.role,
  )}/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLinkAndOtp({
    to: user.email,
    link: redirectUrl,
    otp: "123",
  });

  if (!success) {
    throw new AppError({ message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  res.success(200, "Forgot password link resent successfully on your email", {
    sendCount,
  });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { password } = req.body ?? {};

  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError({ message: "Link token is required", statusCode: 401, code: "AUTH_ERROR" });
  }

  const token = getAuthorizationToken(rawToken);

  if (!token) throw new AppError({ message: "Link token is required", statusCode: 400 });

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) throw new AppError({ message: "Link expired or invalid", statusCode: 400 });

  const parsedData: { sendCount: number; userId: string; otp?: string; verified?: boolean } =
    PARSE_DATA(redisData);

  if (parsedData.otp && !parsedData.verified) {
    throw new AppError({ message: "OTP not verified", statusCode: 400 });
  }

  const user = await getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  if (!user) {
    throw new AppError({ message: "User not found", statusCode: 404, code: "NOT_FOUND" });
  }

  if (!user.providers.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError({
      message: `This account was created using an OAuth (${user.providers.join(
        " / ",
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", ",
      )}).`,
      statusCode: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await user.updateOne({ password: hashedPassword });

  await redisService.getClient()?.del(`forgot-password:${token}`);

  res.success(202, "Password sent on your email address");
};

export const checkPasswordTokenValidityController = async (
  req: Request,
  res: Response,
) => {
  const rawToken = req.get("Authorization");

  const token = getAuthorizationToken(rawToken ?? "");

  const redisData = await redisService
    .getClient()
    ?.get(`forgot-password:${token}`);

  if (!redisData) throw new AppError({ message: "Invalid token", statusCode: 400 });

  res.success(200, "Token is valid");
};
