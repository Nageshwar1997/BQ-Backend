import { Response } from "express";
import { Cart } from "../models";
import { AuthenticatedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { ProductModule } from "../..";

export const getCartController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "products", // All Products in the cart
    populate: [
      {
        path: "product", // Product Path
        model: "Product", // Product Model
        select:
          "title brand originalPrice sellingPrice discount commonImages totalStock", // Required Product Fields
      },
      {
        path: "shade", // Shade Path
        model: "Shade", // Shade Model
        select: "shadeName colorCode images stock", // Required Shade Fields
      },
    ],
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  res.success(200, "Cart fetched successfully", { cart });
};
