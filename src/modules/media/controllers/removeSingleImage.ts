import { Request, Response } from "express";

import { singleImageRemover } from "../utils";

export const removeSingleImageController = async (
  req: Request,
  res: Response
) => {
  const { cloudUrl, cloudinaryConfigOption } = req.body;

  const { result } = await singleImageRemover(cloudUrl, cloudinaryConfigOption);

  res.success(200, "Image removed successfully", {
    deletionStatus: {
      url: cloudUrl,
      status: result === "ok", // true if deleted successfully else false
      message: result,
    },
  });
};
