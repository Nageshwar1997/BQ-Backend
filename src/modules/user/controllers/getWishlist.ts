import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Wishlist } from "../models";

export const getWishlistController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;

  const wishlist = await Wishlist.findById(userId).populate("products").lean();

  res.success(200, "Wishlist fetched successfully", { wishlist });
};
