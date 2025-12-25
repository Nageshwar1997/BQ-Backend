import { Request, Response } from "express";

import { HomeVideo } from "../models";
import { AppError } from "../../../classes";

export const getAllHomeVideosController = async (
  req: Request,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = (page - 1) * limit;

  const query = HomeVideo.find();

  if (page && limit) {
    query.skip(skip);
    query.limit(limit);
  }

  const [videos, totalVideos] = await Promise.all([
    query.lean(),
    HomeVideo.countDocuments(),
  ]);

  if (!videos) {
    throw new AppError("Videos not found", 404);
  }

  res.success(200, "Videos retrieved successfully", {
    videos,
    totalVideos,
    currentPage: page ? page : 1,
    totalPages: page && limit ? Math.ceil(totalVideos / limit) : 1,
  });
};
