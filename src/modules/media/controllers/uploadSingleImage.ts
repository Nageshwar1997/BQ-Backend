import { Request, Response } from "express";

import { allowedOptions } from "../constants";
import { AppError } from "../../../classes";
import { singleImageUploader } from "../utils";

export const uploadSingleImageController = async (
  req: Request,
  res: Response
) => {
  const { cloudinaryConfigOption, folderName } = req.body;
  const file = req.file as Express.Multer.File;

  const result = await singleImageUploader({
    file,
    folder: folderName,
    cloudinaryConfigOption,
  });

  res.success(200, "Image uploaded successfully", {
    cloudUrl: result.secure_url,
  });
};
