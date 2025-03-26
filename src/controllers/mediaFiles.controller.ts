import { NextFunction, Request, Response } from "express";
import { AppError } from "../constructors";
import { CatchErrorResponse, SuccessResponse } from "../utils";
import {
  imageRemover,
  imageUploader,
  videoUploader,
} from "../utils/mediaUploader";
import { HomeVideo } from "../models";
import { AuthorizedRequest } from "../types";

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !(req.files instanceof Array)) {
      throw new AppError("No files uploaded", 400);
    }

    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map(async (file) => {
      const result = await imageUploader({
        file,
        folder: req?.body?.folderName,
      });

      return {
        cloudUrl: result.secure_url,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    SuccessResponse(res, 200, "Images uploaded successfully", {
      uploadedImages,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const result = await imageUploader({
      file: req.file,
      folder: req?.body?.folderName,
    });

    SuccessResponse(res, 200, "Image uploaded successfully", {
      cloudUrl: result.secure_url,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const removeSingleImageUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ImgUrl = req.body.cloudUrl;

    const { result } = await imageRemover(ImgUrl);

    if (result !== "ok" || result === "not found") {
      throw new AppError("Image not found or already removed", 404);
    }

    SuccessResponse(res, 200, "Image removed successfully");
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const removeMultipleImageUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imgUrls: string[] = req.body.cloudUrls;

    if (!imgUrls || imgUrls.length === 0) {
      throw new AppError("No image URLs provided", 400);
    }

    // Delete all images concurrently
    const results = await Promise.all(imgUrls.map((url) => imageRemover(url)));

    // Check if any deletions failed
    const failedDeletions = results.filter(
      (result: any) => result.result !== "ok" && result.result !== "not found"
    );

    if (failedDeletions.length > 0) {
      throw new AppError("Some images could not be removed", 500);
    }

    SuccessResponse(res, 200, "Images removed successfully");
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const uploadHomeVideo = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title } = req.body;
    if (!title) {
      throw new AppError("Title is required", 400);
    }

    const file = req.file as Express.Multer.File;

    if (!file) {
      throw new AppError("No file uploaded", 400);
    }

    if (!file.mimetype.startsWith("video/")) {
      throw new AppError("Invalid file type. Please upload a video file.", 400);
    }
    // Validate allowed file extensions
    const allowedExtensions = ["mp4", "webm"];
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new AppError(
        `Invalid video format. Allowed formats: ${allowedExtensions.join(
          ", "
        )}`,
        400
      );
    }

    // Validate file size (max 20MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_SIZE) {
      throw new AppError("File size exceeds the limit of 50MB.", 400);
    }
    const video = await videoUploader({ file, folder: "Home_Videos" });

    if (!video) {
      throw new AppError("Video upload failed", 500);
    }

    const user = req.user;
    const homeVideo = await HomeVideo.create({
      title,
      m3u8Url: video.playback_url,
      originalUrl: video.secure_url,
      public_id: video.public_id,
      duration: Math.round(video.duration),
      user: user?._id,
    });

    // Success response
    SuccessResponse(res, 200, "Video uploaded successfully", { homeVideo });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const getAllHomeVideos = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    let videos;
    if (page && limit) {
      videos = await HomeVideo.find().skip(skip).limit(limit).lean();
    } else {
      videos = await HomeVideo.find().lean();
    }

    if (!videos) {
      throw new AppError("Videos not found", 404);
    }

    const totalVideos = await HomeVideo.countDocuments();

    SuccessResponse(res, 200, "Videos retrieved successfully", {
      videos,
      totalVideos,
      currentPage: page ? page : 1,
      totalPages: page && limit ? Math.ceil(totalVideos / limit) : 1,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};
