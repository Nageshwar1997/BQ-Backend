import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Utils as CommonUtils } from "../../../common";

import { generateToken } from "../services";
import { Classes } from "../../../common";
import { MediaModule, UserModule } from "../..";

export const registerController = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phoneNumber } = {
    firstName: req.body.firstName.trim().toLowerCase(),
    lastName: req.body.lastName.trim().toLowerCase(),
    email: req.body.email.trim().toLowerCase(),
    password: req.body.password.trim(),
    phoneNumber: req.body.phoneNumber.trim(),
  };

  const isEmailExists = await UserModule.Services.getUserByEmail(email);

  if (isEmailExists) {
    throw new Classes.AppError("Email already exists", 400);
  }

  const isPhoneNumberExists = await UserModule.Services.getUserByPhoneNumber(
    phoneNumber
  );

  if (isPhoneNumberExists) {
    throw new Classes.AppError("Phone number already exists", 400);
  }

  const file = req.file;
  let profilePic = "";
  if (file) {
    const imageResult = await MediaModule.Utils.singleImageUploader({
      file,
      folder: "Profile_Pictures",
      cloudinaryConfigOption: "image",
    });
    profilePic =
      CommonUtils.getCloudinaryOptimizedUrl(imageResult.secure_url) ?? "";
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await UserModule.Models.User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      profilePic,
    });
    const token = generateToken(user._id);

    res.success(201, "User registered successfully", {
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (error) {
    // await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new Classes.AppError("Failed to register user", 500);
  }
};
