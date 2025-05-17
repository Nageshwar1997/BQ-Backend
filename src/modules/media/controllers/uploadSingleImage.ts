import { Request, Response } from "express";
import { Utils as CommonUtils } from "../../../common";
import { Constants, Utils } from "..";
import { Classes } from "../../../common";

export const uploadSingleImage = async (req: Request, res: Response) => {
  const cloudinaryConfigOption = req.body.cloudinaryConfigOption;

  if (
    !cloudinaryConfigOption ||
    !Constants.allowedOptions.includes(cloudinaryConfigOption)
  ) {
    throw new Classes.AppError(
      `Invalid cloudinary config option. Allowed options are "image", "video", or "product".`,
      400
    );
  }

  if (!req.file) {
    throw new Classes.AppError("Image file is required", 404);
  }

  const result = await Utils.singleImageUploader({
    file: req.file,
    folder: req?.body?.folderName,
    cloudinaryConfigOption,
  });

  res.success(200, "Image uploaded successfully", {
    cloudUrl: CommonUtils.getCloudinaryOptimizedUrl(result.secure_url),
  });
};
