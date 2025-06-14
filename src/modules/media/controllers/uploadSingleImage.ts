import { Request, Response } from "express";

import { allowedOptions } from "../constants";
import { AppError } from "../../../classes";
import { singleImageUploader } from "../utils";

export const uploadSingleImageController = async (
  req: Request,
  res: Response
) => {
  const cloudinaryConfigOption = req.body.cloudinaryConfigOption;

  if (
    !cloudinaryConfigOption ||
    !allowedOptions.includes(cloudinaryConfigOption)
  ) {
    throw new AppError(
      `Invalid cloudinary config option. Allowed options are "image", "video", or "product".`,
      400
    );
  }

  if (!req.file) {
    throw new AppError("Image file is required", 404);
  }

  const result = await singleImageUploader({
    file: req.file,
    folder: req?.body?.folderName,
    cloudinaryConfigOption,
  });

  res.success(200, "Image uploaded successfully", {
    cloudUrl: result.secure_url,
  });
};
