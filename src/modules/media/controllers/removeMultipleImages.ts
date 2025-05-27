import { Request, Response } from "express";
import { Constants, Utils } from "..";
import { Classes } from "../../../common";

export const removeMultipleImages = async (req: Request, res: Response) => {
  const imgUrls: string[] = req.body.cloudUrls;

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

  if (!imgUrls || imgUrls.length === 0) {
    throw new Classes.AppError("No image URLs provided", 400);
  }

  const results = await Utils.multipleImagesRemover(
    imgUrls,
    cloudinaryConfigOption
  );

  // Check if any deletions failed
  const deletionStatus = results.map(({ result }, index) => ({
    index,
    url: imgUrls[index],
    status: result === "ok", // true if deleted successfully else false
    message: result,
  }));

  res.success(200, "Images removed successfully", { deletionStatus });
};
