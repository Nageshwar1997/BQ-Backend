import { AuthenticatedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { Cart } from "../models";
import { IPopulatedCart } from "../types";

export const getUserCart = async (req: AuthenticatedRequest) => {
  const userId = req.user?._id;
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "products", // All Products in the cart
      populate: [
        {
          path: "product", // Product Path
          model: "Product", // Product Model
          select:
            "title brand originalPrice sellingPrice discount commonImages totalStock", // Required Product Fields
          options: { select: { commonImages: { $slice: 1 } } }, // Required Product Options
        },
        {
          path: "shade",
          model: "Shade",
          select: "shadeName colorCode images stock", // Required Shade Fields
          options: { select: { images: { $slice: 1 } } }, // Required Shade Options
        },
      ],
    })
    .lean();

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  return cart as unknown as IPopulatedCart;
};
