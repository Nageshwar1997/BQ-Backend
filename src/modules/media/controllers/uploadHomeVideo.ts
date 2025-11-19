import { Response } from "express";

import { AuthorizedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from "../../../constants";
import {
  singleImageRemover,
  singleImageUploader,
  singleVideoRemover,
  singleVideoUploader,
} from "../utils";
import { HomeVideo } from "../models";

export const uploadHomeVideoController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { title, cloudinaryConfigOption } = req.body;
  const userId = req.user?._id;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const videoFile = files?.video?.[0];
  const posterFile = files?.poster?.[0];

  if (!videoFile) {
    throw new AppError("No video file uploaded", 400);
  }

  if (!posterFile) {
    throw new AppError("Poster file is required.", 400);
  }

  if (!ALLOWED_VIDEO_TYPES.includes(videoFile.mimetype)) {
    throw new AppError(
      `Invalid video format. Allowed formats: ${ALLOWED_VIDEO_TYPES.map((t) =>
        t.replace("video/", "")
      ).join(", ")}`,
      400
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(posterFile.mimetype)) {
    throw new AppError(
      `Invalid poster format. Allowed formats: ${ALLOWED_IMAGE_TYPES.map((t) =>
        t.replace("image/", "")
      ).join(", ")}`,
      400
    );
  }

  // Upload video
  const video = await singleVideoUploader({
    file: videoFile,
    folder: `Home/Videos/${title}`,
    cloudinaryConfigOption,
  });
  if (!video) {
    throw new AppError("Video upload failed", 500);
  }

  const poster = await singleImageUploader({
    file: posterFile,
    folder: `Home/Videos/${title}`,
    cloudinaryConfigOption,
  });
  if (!poster) {
    await singleVideoRemover(video.secure_url, cloudinaryConfigOption);
    throw new AppError("Poster upload failed", 500);
  }

  try {
    const homeVideo = await HomeVideo.create({
      title,
      m3u8Url: video.playback_url,
      originalUrl: video.secure_url,
      public_id: video.public_id,
      duration: Math.round(video.duration),
      posterUrl: poster.secure_url,
      user: userId,
    });
    res.success(201, "Video uploaded successfully", { homeVideo });
  } catch {
    // Clean up uploaded files from Cloudinary
    await Promise.all([
      singleVideoRemover(video.secure_url, cloudinaryConfigOption),
      singleImageRemover(poster.secure_url, cloudinaryConfigOption),
    ]);
    throw new AppError("Failed to upload video", 500);
  }
};
