import { Request, Response } from "express";
import { Constants, Utils } from "..";
import { Classes } from "../../../common";

export const removeSingleImage = async (req: Request, res: Response) => {
  const imgUrl = req.body.cloudUrl;
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

  const { result } = await Utils.singleImageRemover(
    imgUrl,
    cloudinaryConfigOption
  );

  res.success(200, "Image removed successfully", {
    deletionStatus: {
      url: imgUrl,
      status: result === "ok", // true if deleted successfully else false
      message: result,
    },
  });
};
