import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { updateUser } from "../services";
import { MediaModule } from "../..";
import { AppError } from "../../../classes";

export const updateUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { file, user } = req ?? {};

  let profilePic;

  if (file) {
    const cldResp = await MediaModule.Utils.singleImageUploader({
      file,
      cloudinaryConfigOption: "image",
      folder: "Profile_Pictures",
    });

    profilePic = cldResp?.secure_url || "";
  }

  const updatedUser = await updateUser({ ...req.body, profilePic }, user?._id);

  if (!updatedUser && profilePic) {
    await MediaModule.Utils.singleImageRemover(profilePic, "image");
    throw new AppError("User not found", 404);
  } else if (updatedUser && file && user?.profilePic) {
    await MediaModule.Utils.singleImageRemover(user?.profilePic, "image");
  }

  const { password: _, ...restUser } = updatedUser?.toObject() ?? {};

  res.success(200, "User updated successfully", { user: restUser });
};
