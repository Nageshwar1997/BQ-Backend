import { Request, Response } from "express";

import { multipleImagesRemover } from "../utils";

export const removeMultipleImagesController = async (
  req: Request,
  res: Response
) => {
  const { cloudUrls, cloudinaryConfigOption } = req.body;

  const results = await multipleImagesRemover(
    cloudUrls,
    cloudinaryConfigOption
  );

  // Check if any deletions failed
  const deletionStatus = results.map(({ result }, index) => ({
    index,
    url: cloudUrls[index],
    status: result === "ok", // true if deleted successfully else false
    message: result,
  }));

  res.success(200, "Images removed successfully", { deletionStatus });
};
