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
  res: Response
) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  if (user?.password === newPassword || newPassword === oldPassword) {
    throw new AppError(
      "New password must be different from current password.",
      400
    );
  }
  const isPasswordMatch = bcrypt.compareSync(oldPassword, user?.password || "");

  if (!isPasswordMatch) {
    throw new AppError("Old password is incorrect", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await updateUser(user?._id, { password: hashedPassword });

  const { password: _, ...restUser } = updatedUser?.toObject() ?? {};

  res.success(200, "Password changed successfully", { user: restUser });
};

export const updatePasswordController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { newPassword } = req.body;

  if (user?.password === newPassword) {
    throw new AppError(
      "New password must be different from current password.",
      400
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

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
  res: Response
) => {
  const user = req.user!;

  const resetToken = generateTokenForRedis(32);

  await redisService.getClient()?.setEx(
    `resetPassword:${resetToken}`,
    MINUTE * MINUTE, // 1 hour in seconds
    user._id.toString()
  );

  // 3️⃣ Create password reset URL
  const resetUrl = `${getFrontendURL(
    user.role
  )}/reset-password?token=${resetToken}`;

  const { message, success } = await mailService.sendPasswordResetLink({
    to: user.email,
    resetLink: resetUrl,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "Password reset link sent successfully");
};

export const validResetPasswordTokenController = async (
  req: Request,
  res: Response
) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError("Reset token missing", 401);
  }

  const token = getAuthorizationToken(rawToken);

  const redisKey = `resetPassword:${token}`;
  const userId = await redisService.getClient()?.get(redisKey);

  if (!userId) {
    throw new AppError("Reset link is invalid or has expired", 400);
  }

  res.success(200, "Token is valid");
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError("Reset token missing", 401);
  }

  const token = getAuthorizationToken(rawToken);

  const redisKey = `resetPassword:${token}`;
  const userId = await redisService.getClient()?.get(redisKey);

  if (!userId) {
    throw new AppError("Reset link is invalid or has expired", 400);
  }

  const { newPassword } = req.body ?? {};

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUser(userId, {
    password: hashedPassword,
  });

  await redisService.getClient()?.del(redisKey);

  res.success(200, "Password reset successfully");
};

export const forgotPasswordSendLinkController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body ?? {};

  const user = await getUserByEmail(email, true);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.providers.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError(
      `This account was created using an OAuth (${user.providers.join(
        " / "
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", "
      )}).`,
      400
    );
  }

  const token = generateTokenForRedis(32);

  await redisService.getClient()?.setEx(
    `forgotPassword:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({
      userId: user._id,
      sendCount: 1,
    })
  );

  const redirectUrl = `${getFrontendURL(
    user.role
  )}/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLink({
    to: user.email,
    link: redirectUrl,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "Forgot password link sent successfully on your email", {
    token,
  });
};

export const forgotPasswordResendLinkController = async (
  req: Request,
  res: Response
) => {
  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError("Link token is required", 401);
  }

  const token = getAuthorizationToken(rawToken);

  const redisData = await redisService
    .getClient()
    ?.get(`forgotPassword:${token}`);

  if (!redisData) throw new AppError("Link expired or invalid", 400);

  const parsedData: { sendCount: number; userId: string } =
    PARSE_DATA(redisData);

  // Increment sendCount and check limit
  const sendCount = (parsedData?.sendCount ?? 1) + 1;
  if (sendCount > MAX_RESEND) {
    throw new AppError("Maximum resend attempts reached, try again later", 400);
  }

  const user = await getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  if (!user?.providers?.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError(
      `This account was created using an OAuth (${user.providers.join(
        " / "
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", "
      )}).`,
      400
    );
  }

  await redisService.getClient()?.setEx(
    `forgotPassword:${token}`,
    MINUTE * MINUTE, // 1 hour in seconds
    STRINGIFY_DATA({ userId: user._id, sendCount })
  );

  const redirectUrl = `${getFrontendURL(
    user.role
  )}/forgot-password?token=${token}`;

  const { message, success } = await mailService.sendForgotPasswordLink({
    to: user.email,
    link: redirectUrl,
  });

  if (!success) {
    throw new AppError(message, 500);
  }

  res.success(200, "Forgot password link resent successfully on your email", {
    sendCount,
  });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { newPassword } = req.body ?? {};

  const rawToken = req.get("Authorization");

  if (!rawToken) {
    throw new AppError("Link token is required", 401);
  }

  const token = getAuthorizationToken(rawToken);

  if (!token) throw new AppError("Link token is required", 400);

  const redisData = await redisService
    .getClient()
    ?.get(`forgotPassword:${token}`);

  if (!redisData) throw new AppError("Link expired or invalid", 400);

  const parsedData: { sendCount: number; userId: string } =
    PARSE_DATA(redisData);

  const user = await getUserById({
    id: parsedData.userId,
    lean: false,
    password: false,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.providers.includes("MANUAL")) {
    // Check if user has MANUAL login
    throw new AppError(
      `This account was created using an OAuth (${user.providers.join(
        " / "
      )}) login. Please login using your provider (e.g., ${user.providers.join(
        ", "
      )}).`,
      400
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.updateOne({ password: hashedPassword });

  await redisService.getClient()?.del(`forgotPassword:${token}`);

  res.success(202, "Password sent on your email address");
};

export const checkPasswordTokenValidityController = async (
  req: Request,
  res: Response
) => {
  const rawToken = req.get("Authorization");

  const token = getAuthorizationToken(rawToken ?? "");

  const redisData = await redisService
    .getClient()
    ?.get(`forgotPassword:${token}`);

  if (!redisData) throw new AppError("Invalid token", 400);

  res.success(200, "Token is valid");
};
