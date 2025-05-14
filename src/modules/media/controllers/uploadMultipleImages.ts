import { Request, Response } from "express";

import { Shared } from "../../../shared";
import { allowedOptions } from "../constants";
import { singleImageUploader } from "../utils";
import { getCloudinaryOptimizedUrl } from "../../../utils";

export const uploadMultipleImagesController = async (
  req: Request,
  res: Response
) => {
  if (!req.files || !(req.files instanceof Array)) {
    throw new Shared.Classes.AppError("No files uploaded", 400);
  }

  const cloudinaryConfigOption = req.body?.cloudinaryConfigOption;

  if (
    !cloudinaryConfigOption ||
    !allowedOptions.includes(cloudinaryConfigOption)
  ) {
    throw new Shared.Classes.AppError(
      `Invalid cloudinary config option. Allowed options are "image", "video", or "product".`,
      400
    );
  }

  const files = req.files as Express.Multer.File[];

  const uploadPromises = files.map(async (file) => {
    const result = await singleImageUploader({
      file,
      folder: req?.body?.folderName,
      cloudinaryConfigOption,
    });

    return {
      cloudUrl: getCloudinaryOptimizedUrl(result.secure_url),
    };
  });

  const uploadedImages = await Promise.all(uploadPromises);
  res.success(200, "Images uploaded successfully", {
    uploadedImages,
  });
};
