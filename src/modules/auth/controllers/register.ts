import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { AppError } from "../../../classes";
import { MediaModule, UserModule } from "../..";
import { generateToken } from "../services";

export const registerController = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body ?? {};

  let [user, existingPhoneUser] = await Promise.all([
    UserModule.Services.getUserByEmail(email, false),
    UserModule.Services.getUserByPhoneNumber(phoneNumber, true),
  ]);

  const isPhoneNumberExists =
    existingPhoneUser &&
    existingPhoneUser._id.toString() !== user?._id.toString();

  if (isPhoneNumberExists) {
    throw new AppError("Phone number already exists", 400);
  }

  // Profile picture upload
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
    if (user) {
      // User exists → OAuth-only
      if (!user.providers.includes("MANUAL")) {
        user.password = hashedPassword;
        user.providers.push("MANUAL");
        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;
        if (profilePic) user.profilePic = profilePic;
        await user.save();
      } else {
        throw new AppError("Email already exists", 400);
      }
    } else {
      // Completely new user → create
      user = await UserModule.Models.User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        profilePic,
        providers: ["MANUAL"],
      });
    }

    const { password: _, ...restUser } = user;

    const token = generateToken(user._id);

    res.success(201, "User registered successfully", { token, user: restUser });
  } catch (error) {
    if (profilePic)
      await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError("Failed to register user", 500);
  }
};
