import { NextFunction, Response } from "express";
import { ClientSession, Types } from "mongoose";
import { AuthenticatedRequest } from "../../../types";
import { Wishlist } from "../models";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";

export const removeProductFromWishlistController = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const userId = req.user?._id;
  const { productId } = req.params;

  isValidMongoId(productId, "Invalid productId", 400);

  // Remove product atomically using session
  const updatedWishlist = await Wishlist.findByIdAndUpdate(
    userId,
    { $pull: { products: new Types.ObjectId(productId?.toString()) } },
    { new: true, session }
  );

  if (!updatedWishlist) {
    throw new AppError({ message: "Wishlist not found", statusCode: 404, code: "NOT_FOUND" });
  }

  // If wishlist is empty after removal, delete it (also within the session)
  if (updatedWishlist.products?.length === 0) {
    const deletedWishlist = await Wishlist.findByIdAndDelete(userId, {
      session,
    });

    if (!deletedWishlist) {
      throw new AppError({ message: "Failed to remove wishlist product", statusCode: 500, code: "INTERNAL_ERROR" });
    }
  }

  res.success(200, "Product removed from wishlist successfully");
};
