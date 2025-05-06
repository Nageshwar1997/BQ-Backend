import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";

import { AppError } from "../../../classes";
import { UserModule } from "../..";
import { generateToken } from "../providers";

export const loginController = async (req: Request, res: Response) => {
  const { email, password, phoneNumber } = {
    email: req.body.email?.trim().toLowerCase(),
    password: req.body.password.trim(),
    phoneNumber: req.body.phoneNumber?.trim(),
  };

  const user = await UserModule.Services.getUserByEmailOrPhoneNumber(
    email,
    phoneNumber
  );

  const isPasswordMatch = bcrypt.compareSync(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError("Wrong password", 400);
  }

  const token = generateToken(user._id as Types.ObjectId);

  res.success(200, "User logged in successfully", {
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    },
  });
};
