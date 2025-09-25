import { Request, Response } from "express";

import { AppError } from "../../../classes";
import { allowedOptions } from "../constants";
import { singleImageUploader } from "../utils";

export const uploadMultipleImagesController = async (
  req: Request,
  res: Response
) => {
  const { cloudinaryConfigOption, folderName } = req.body;

  const files = req.files as Express.Multer.File[];

  const uploadPromises = files.map(async (file) => {
    const result = await singleImageUploader({
      file,
      folder: folderName,
      cloudinaryConfigOption,
    });

    return { cloudUrl: result.secure_url };
  });

  const uploadedImages = await Promise.all(uploadPromises);
  res.success(200, "Images uploaded successfully", {
    uploadedImages,
  });
};
