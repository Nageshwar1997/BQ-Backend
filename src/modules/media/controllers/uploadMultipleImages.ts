import { Request, Response } from "express";
import { Classes, Utils as CommonUtils } from "../../../common";
import { Constants, Utils } from "..";

export const uploadMultipleImages = async (req: Request, res: Response) => {
  if (!req.files || !(req.files instanceof Array)) {
    throw new Classes.AppError("No files uploaded", 400);
  }

  const cloudinaryConfigOption = req.body?.cloudinaryConfigOption;

  if (
    !cloudinaryConfigOption ||
    !Constants.allowedOptions.includes(cloudinaryConfigOption)
  ) {
    throw new Classes.AppError(
      `Invalid cloudinary config option. Allowed options are "image", "video", or "product".`,
      400
    );
  }

  const files = req.files as Express.Multer.File[];

  const uploadPromises = files.map(async (file) => {
    const result = await Utils.singleImageUploader({
      file,
      folder: req?.body?.folderName,
      cloudinaryConfigOption,
    });

    return {
      cloudUrl: CommonUtils.getCloudinaryOptimizedUrl(result.secure_url),
    };
  });

  const uploadedImages = await Promise.all(uploadPromises);
  res.success(200, "Images uploaded successfully", {
    uploadedImages,
  });
};
