import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { MediaModule, ProductModule } from "../..";
import { Review } from "../models";

export const createReviewController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { productId } = req?.params;

  if (!productId) {
    throw new AppError("Product Id is required", 400);
  }
  isValidMongoId(productId, "Invalid Product Id provided", 404);

  const body = req.body;
  const user = req.user;

  let uploadedImages: string[] = [];
  let uploadedVideos: string[] = [];
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const images = files?.images;
  const videos = files?.videos;

  const product = await ProductModule.Models.Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (images?.length) {
    const imgsResult = await MediaModule.Utils.multipleImagesUploader({
      files: images,
      folder: `Reviews/${product.title}`,
      cloudinaryConfigOption: "image",
    });
    uploadedImages = imgsResult.map((img) => img.secure_url);
  }

  if (videos?.length) {
    const vidsResult = await MediaModule.Utils.multipleVideosUploader({
      files: videos,
      folder: `Reviews/${product.title}`,
      cloudinaryConfigOption: "video",
    });
    uploadedVideos = vidsResult.map((vid) => vid.playback_url);
  }

  const review = await Review.create({
    product: productId,
    user: user?._id,
    rating: body.rating,
    title: body.title,
    comment: body.comment,
    images: uploadedImages,
    videos: uploadedVideos,
    likes: [],
    dislikes: [],
    helpful: [],
  });

  if (!review) {
    if (uploadedImages?.length) {
      await MediaModule.Utils.multipleImagesRemover(uploadedImages, "image");
    }
    if (uploadedVideos?.length) {
      await MediaModule.Utils.multipleVideosRemover(uploadedVideos, "video");
    }
    throw new AppError("Failed to create review", 500);
  }

  product.reviews.push(review._id);
  await product.save({ validateBeforeSave: false });

  res.success(200, "Review created successfully");
};
