import bcrypt from "bcryptjs";
import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { updateUser } from "../services";
import { TAuthProvider } from "../types";

export const changePasswordController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const isPasswordMatch = bcrypt.compareSync(oldPassword, user?.password || "");

  if (!isPasswordMatch) {
    throw new Error("Old password is incorrect");
  }

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

export const forgotPasswordSendOtpController = async (
  _req: AuthenticatedRequest,
  _res: Response
) => {};

export const forgotPasswordResendController = async (
  _req: AuthenticatedRequest,
  _res: Response
) => {};

export const forgotPasswordVerifyOtpController = async (
  _req: AuthenticatedRequest,
  _res: Response
) => {};
