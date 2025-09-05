import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import { AppError } from "../../../classes";
import { CartModule, MediaModule, UserModule } from "../..";
import { generateToken } from "../services";

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
    throw new AppError("Email already exists", 400);
  }

  const isPhoneNumberExists = await UserModule.Services.getUserByPhoneNumber(
    phoneNumber
  );

  if (isPhoneNumberExists) {
    throw new AppError("Phone number already exists", 400);
  }

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
    const user = await UserModule.Models.User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      profilePic,
    });

    const token = generateToken(user._id);

    // create cart
    const cart = new CartModule.Models.Cart({
      user: user._id,
      products: [],
      charges: 0,
    });

    await cart.save();

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
    await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError("Failed to register user", 500);
  }
};
