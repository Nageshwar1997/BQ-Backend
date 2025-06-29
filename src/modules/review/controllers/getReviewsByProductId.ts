import { Request, Response } from "express";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { Review } from "../models";

export const getReviewsByIdController = async (req: Request, res: Response) => {
  const { productId } = req?.params;

  if (!productId) {
    throw new AppError("Product Id is required", 400);
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);

  const reviews = await Review.find({ product: productId }).lean();

  if (!reviews) {
    throw new AppError("Review not found", 404);
  }

  res.success(200, "Review fetched successfully", { reviews });
};
