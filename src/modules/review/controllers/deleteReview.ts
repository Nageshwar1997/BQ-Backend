import { Response } from "express";
import { MediaModule, ProductModule } from "../..";
import { AuthenticatedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { checkUserPermission, isValidMongoId } from "../../../utils";
import { Review } from "../models";

export const deleteReviewController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { productId, reviewId } = req.params;

  if (!productId || !reviewId) {
    throw new AppError("Product Id and Review Id are required", 400);
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);
  isValidMongoId(reviewId, "Invalid Review Id provided", 404);

  const product = await ProductModule.Models.Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.reviews = product.reviews.filter((id) => id.toString() !== reviewId);
  await product.save();

  const review = await Review.findByIdAndDelete(reviewId).lean();
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (req.user?.role !== "MASTER") {
    checkUserPermission({
      checkId: review.user,
      userId: req.user?._id as string,
      message: "You are not authorized to delete this review",
      statusCode: 403,
    });
  }

  const imageUrls = review.images;
  const videoUrls = review.videos;
  if (imageUrls.length) {
    await MediaModule.Utils.multipleImagesRemover(imageUrls, "image");
  }
  if (videoUrls.length) {
    await MediaModule.Utils.multipleVideosRemover(videoUrls, "video");
  }
  res.success(200, "Review deleted successfully");
};
