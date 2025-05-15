import { Request, Response } from "express";

import { allowedOptions } from "../constants";
import { Shared } from "../../..";
import { singleImageUploader } from "../utils";
import { getCloudinaryOptimizedUrl } from "../../../utils";

export const uploadSingleImageController = async (
  req: Request,
  res: Response
) => {
  const cloudinaryConfigOption = req.body.cloudinaryConfigOption;

  if (
    !cloudinaryConfigOption ||
    !allowedOptions.includes(cloudinaryConfigOption)
  ) {
    throw new Shared.Classes.AppError(
      `Invalid cloudinary config option. Allowed options are "image", "video", or "product".`,
      400
    );
  }

  if (!req.file) {
    throw new Shared.Classes.AppError("Image file is required", 404);
  }

  const result = await singleImageUploader({
    file: req.file,
    folder: req?.body?.folderName,
    cloudinaryConfigOption,
  });

  res.success(200, "Image uploaded successfully", {
    cloudUrl: getCloudinaryOptimizedUrl(result.secure_url),
  });
};
