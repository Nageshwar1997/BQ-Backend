import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { MediaModule } from "../..";
import { Review } from "../models";
import { possibleUpdateReviewFields } from "../constants";

export const updateReviewController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { productId, reviewId } = req?.params;

  if (!productId) {
    throw new AppError("Product Id is required", 400);
  }
  if (!reviewId) {
    throw new AppError("Review Id is required", 400);
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);
  isValidMongoId(reviewId, "Invalid Review Id provided", 404);

  const body = req.body;
  const { productTitle, removedImages, removedVideos } = req.body ?? {};

  let uploadedImages: string[] = [];
  let uploadedVideos: string[] = [];
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const images = files?.images;
  const videos = files?.videos;

  if ((images?.length || videos?.length) && !productTitle) {
    throw new AppError(
      "Product Title is required when uploading images or videos",
      400
    );
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (removedImages?.length) {
    review.images =
      review.images?.filter((img) => !removedImages.includes(img)) ?? [];
    await MediaModule.Utils.multipleImagesRemover(removedImages, "image");
  }

  if (removedVideos?.length) {
    review.videos =
      review?.videos.filter((vid) => !removedVideos.includes(vid)) ?? [];
    await MediaModule.Utils.multipleVideosRemover(removedVideos, "video");
  }

  if (files) {
    if (images?.length) {
      const imgsResult = await MediaModule.Utils.multipleImagesUploader({
        files: images,
        folder: `Reviews/${productTitle}`,
        cloudinaryConfigOption: "image",
      });
      uploadedImages = imgsResult.map((img) => img.secure_url);
      review?.images.push(...uploadedImages);
    }

    if (videos?.length) {
      const vidsResult = await MediaModule.Utils.multipleVideosUploader({
        files: videos,
        folder: `Reviews/${productTitle}`,
        cloudinaryConfigOption: "video",
      });
      uploadedVideos = vidsResult.map((vid) => vid.playback_url);
      review?.videos.push(...uploadedVideos);
    }
  }

  for (const field of possibleUpdateReviewFields) {
    const value = body[field];
    if (value && value !== undefined && value !== null) {
      (review[field] as unknown) = value;
    }
  }

  try {
    await review.save({ validateBeforeSave: false });
  } catch (error) {
    if (uploadedImages.length) {
      await MediaModule.Utils.multipleImagesRemover(uploadedImages, "image");
    }
    if (uploadedVideos.length) {
      await MediaModule.Utils.multipleVideosRemover(uploadedVideos, "video");
    }
    throw error;
  }

  res.success(200, "Review updated successfully", { review });
};
