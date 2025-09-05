import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { CartModule, CartProductModule } from "../..";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";

export const addProductToCartController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;
  const { productId } = req.params;
  const { shadeId } = req.query;

  if (!productId) {
    throw new AppError("Product Id is required", 400);
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);

  // 1️ Ensure cart exists (create if not)
  const cart = await CartModule.Models.Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, products: [], charges: 0 } },
    { new: true, upsert: true }
  );

  if (!cart) {
    throw new AppError("Failed to create or fetch cart", 500);
  }

  // 2️ Check if cartProduct already exists
  const existCartProduct = await CartProductModule.Models.CartProduct.findOne({
    cart: cart._id,
    product: productId,
    shade: shadeId ?? null,
  });

  if (existCartProduct) {
    throw new AppError("Product already exists in cart", 400);
  }

  // 3️ Create new CartProduct
  const cartProduct = await CartProductModule.Models.CartProduct.create({
    cart: cart._id,
    product: productId,
    shade: shadeId ?? null,
    quantity: 1,
  });

  // 4️ Ensure CartProduct reference is in cart
  cart.products.push(cartProduct._id);
  await cart.save();

  res.success(200, "Product added to cart successfully");
};
