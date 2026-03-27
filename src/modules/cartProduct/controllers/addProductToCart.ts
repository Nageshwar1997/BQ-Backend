import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { CartModule } from "../..";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { CartProduct } from "../models";
import { ObjectIdQueryTypeCasting } from "mongoose";

export const addProductToCartController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?._id;
  const { productId } = req.params;
  const { shadeId } = req.query;

  if (!productId) {
    throw new AppError({ message: "Product Id is required", statusCode: 400 });
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);

  // 1️ Ensure cart exists (create if not)
  const cart = await CartModule.Models.Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, products: [], charges: 0 } },
    { new: true, upsert: true },
  );

  if (!cart) {
    throw new AppError({ message: "Failed to create or fetch cart", statusCode: 500, code: "INTERNAL_ERROR" });
  }

  // 2️ Check if cartProduct already exists
  const existCartProduct = await CartProduct.findOne({
    cart: cart._id,
    product: productId,
    shade: shadeId ?? null,
  });

  if (existCartProduct) {
    throw new AppError({ message: "Product already exists in cart", statusCode: 400 });
  }

  // 3️ Create new CartProduct
  const cartProduct = await CartProduct.create({
    cart: cart._id,
    product: productId?.toString(),
    shade: (shadeId ?? null) as ObjectIdQueryTypeCasting,
    quantity: 1,
  });

  // 4️ Ensure CartProduct reference is in cart
  cart.products.push(cartProduct._id);
  await cart.save();

  res.success(200, "Product added to cart successfully");
};
