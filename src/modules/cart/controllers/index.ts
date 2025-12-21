import { NextFunction, Response } from "express";
import { ClientSession, HydratedDocument } from "mongoose";
import { getUserCart } from "../services";
import { AuthenticatedRequest } from "../../../types";
import { CartModule, CartProductModule, ProductModule } from "../..";
import { AppError } from "../../../classes";
import { IPopulatedCart } from "../types";

export const getCartController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const cart = await getUserCart(req);

  res.success(200, "Cart fetched successfully", { cart });
};

export const clearCartController = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const user = req.user;

  const cart = (await CartModule.Models.Cart.findOne({
    user: user?._id,
  }).populate({
    path: "products", // All Products in the cart
    populate: [
      {
        path: "product", // Product Path
        model: "Product", // Product Model
        select: "totalStock", // Required Product Fields
      },
      {
        path: "shade",
        model: "Shade",
        select: "stock", // Required Shade Fields
      },
    ],
  })) as HydratedDocument<IPopulatedCart> | null;

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  for (const item of cart.products) {
    await ProductModule.Models.Product.updateOne(
      { _id: item.product._id },
      { $inc: { totalStock: -item.quantity } },
      { session }
    );

    if (item.shade?._id) {
      await ProductModule.Models.Shade.updateOne(
        { _id: item.shade._id },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }
  }

  await CartProductModule.Models.CartProduct.deleteMany(
    { _id: { $in: cart.products.map((p) => p._id) } },
    { session }
  );

  await cart.updateOne({ $set: { products: [], charges: 0 } }, { session });

  res.success(200, "Order placed successfully");
};
