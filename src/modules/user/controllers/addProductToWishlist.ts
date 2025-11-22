import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Wishlist } from "../models";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { Types } from "mongoose";

export const addProductToWishlistController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;
  const { productId } = req.params;

  isValidMongoId(productId, "Invalid productId", 400);

  // Upsert wishlist and add product duplicate-free in one query
  const wishlist = await Wishlist.findOneAndUpdate(
    { _id: userId },
    {
      $setOnInsert: { _id: userId },
      $addToSet: { products: new Types.ObjectId(productId) },
    },
    { new: true, upsert: true }
  );

  if (!wishlist) {
    throw new AppError("Failed to add product to wishlist", 500);
  }

  res.success(200, "Product added to wishlist successfully");
};
