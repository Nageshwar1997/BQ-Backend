import { Response } from "express";
import { Classes, Types as CommonTypes } from "../../../common";

import { Models } from "..";

export const getAllHomeVideos = async (
  req: CommonTypes.AuthRequest,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = (page - 1) * limit;

  const videos = await Models.HomeVideo.find()
    .skip(page && limit ? skip : 0)
    .limit(page && limit ? limit : 0)
    .lean();

  if (!videos) {
    throw new Classes.AppError("Videos not found", 404);
  }

  const totalVideos = await Models.HomeVideo.countDocuments();

  res.success(200, "Videos retrieved successfully", {
    videos,
    totalVideos,
    currentPage: page ? page : 1,
    totalPages: page && limit ? Math.ceil(totalVideos / limit) : 1,
  });
};
