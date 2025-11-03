import { Request, Response } from "express";
import { multipleImagesUploader } from "../utils";

export const uploadMultipleImagesController = async (
  req: Request,
  res: Response
) => {
  const { cloudinaryConfigOption, folderName } = req.body;

  const files = req.files as Express.Multer.File[];

  const result = await multipleImagesUploader({
    files,
    folder: folderName,
    cloudinaryConfigOption,
  });

  const uploadedImages = result.map((result) => {
    return { cloudUrl: result.secure_url };
  });

  res.success(200, "Images uploaded successfully", {
    uploadedImages,
  });
};
