import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { updateUser } from "../services";
import { MediaModule } from "../..";
import { AppError } from "../../../classes";
import { User } from "../models";

export const updateUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { file, user, body } = req ?? {};

  const { phoneNumber } = body ?? {};

  if (phoneNumber) {
    const existingUser = await User.findOne({
      phoneNumber,
      _id: { $ne: user?._id },
    }).lean();

    if (existingUser) {
      throw new AppError("Phone number already in use", 409);
    }
  }

  let profilePic;

  if (file) {
    const cldResp = await MediaModule.Utils.singleImageUploader({
      file,
      cloudinaryConfigOption: "image",
      folder: "Profile_Pictures",
    });

    profilePic = cldResp?.secure_url || "";
  }

  const updatedUser = await updateUser(user?._id, { ...body, profilePic });

  if (!updatedUser && profilePic) {
    await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError("User not found", 404);
  } else if (updatedUser && file && user?.profilePic) {
    await MediaModule.Utils.singleImageRemover(user?.profilePic, "image");
  }

  const { password: _, ...restUser } = updatedUser?.toObject() ?? {};

  res.success(200, "User updated successfully", { user: restUser });
};
