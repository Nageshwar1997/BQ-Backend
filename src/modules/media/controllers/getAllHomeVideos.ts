import { Response } from "express";

import { AuthorizedRequest } from "../../../types";
import { HomeVideo } from "../models";
import { Shared } from "../../../shared";

export const getAllHomeVideosController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = (page - 1) * limit;

  const videos = await HomeVideo.find()
    .skip(page && limit ? skip : 0)
    .limit(page && limit ? limit : 0)
    .lean();

  if (!videos) {
    throw new Shared.Classes.AppError("Videos not found", 404);
  }

  const totalVideos = await HomeVideo.countDocuments();

  res.success(200, "Videos retrieved successfully", {
    videos,
    totalVideos,
    currentPage: page ? page : 1,
    totalPages: page && limit ? Math.ceil(totalVideos / limit) : 1,
  });
};
