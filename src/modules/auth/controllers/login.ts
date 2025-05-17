import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { Services } from "..";
import { UserModule } from "../..";
import { Classes } from "../../../common";

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
    throw new Classes.AppError("Wrong password", 400);
  }

  const token = Services.generateToken(user._id);

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
