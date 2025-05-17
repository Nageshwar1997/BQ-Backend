import { Response } from "express";

import { AuthorizedRequest } from "../../../types";
import { allowedOptions } from "../constants";
import { Classes } from "../../../shared";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE,
} from "../../../constants";
import {
  singleImageRemover,
  singleImageUploader,
  videoRemover,
  videoUploader,
} from "../utils";
import { getCloudinaryOptimizedUrl } from "../../../utils";
import { HomeVideo } from "../models";

export const uploadHomeVideoController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { title } = req.body;
  const cloudinaryConfigOption = req.body.cloudinaryConfigOption;

  if (
    !cloudinaryConfigOption ||
    !allowedOptions.includes(cloudinaryConfigOption)
  ) {
    throw new Classes.AppError(
      `Invalid cloudinary config option. Allowed options are "image", "video", or "product".`,
      400
    );
  }

  if (!title) {
    throw new Classes.AppError("Title is required", 400);
  }

  const files = req.files as {
    video?: Express.Multer.File[];
    poster?: Express.Multer.File[];
  };

  const videoFile = files?.video?.[0];
  const posterFile = files?.poster?.[0];

  if (!videoFile) {
    throw new Classes.AppError("No video file uploaded", 400);
  }

  if (!posterFile) {
    throw new Classes.AppError("Poster file is required.", 400);
  }

  if (!ALLOWED_VIDEO_TYPES.includes(videoFile.mimetype)) {
    throw new Classes.AppError(
      `Invalid video format. Allowed formats: ${ALLOWED_VIDEO_TYPES.map((t) =>
        t.replace("video/", "")
      ).join(", ")}`,
      400
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(posterFile.mimetype)) {
    throw new Classes.AppError(
      `Invalid poster format. Allowed formats: ${ALLOWED_IMAGE_TYPES.map((t) =>
        t.replace("image/", "")
      ).join(", ")}`,
      400
    );
  }

  if (videoFile.size > MAX_VIDEO_FILE_SIZE) {
    throw new Classes.AppError("Video file size exceeds 50MB.", 400);
  }

  if (posterFile.size > MAX_IMAGE_FILE_SIZE) {
    throw new Classes.AppError("Poster image size exceeds 2MB.", 400);
  }

  // Upload video
  const video = await videoUploader({
    file: videoFile,
    folder: `Home/Videos/${title}`,
    cloudinaryConfigOption,
  });
  if (!video) throw new Classes.AppError("Video upload failed", 500);

  const poster = await singleImageUploader({
    file: posterFile,
    folder: `Home/Videos/${title}`,
    cloudinaryConfigOption,
  });
  if (!poster) throw new Classes.AppError("Poster upload failed", 500);

  const user = req.user;
  let homeVideo;
  try {
    homeVideo = await HomeVideo.create({
      title,
      m3u8Url: video.playback_url,
      originalUrl: video.secure_url,
      public_id: video.public_id,
      duration: Math.round(video.duration),
      posterUrl: getCloudinaryOptimizedUrl(poster.secure_url),
      user: user?._id,
    });
    res.success(201, "Video uploaded successfully", { homeVideo });
  } catch (dbError) {
    // Clean up uploaded files from Cloudinary
    await Promise.all([
      videoRemover(video.playback_url, cloudinaryConfigOption),
      singleImageRemover(poster.secure_url, cloudinaryConfigOption),
    ]);
    throw new Classes.AppError("Failed to save video metadata", 500);
  }
};
