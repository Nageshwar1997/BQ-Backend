import { NextFunction, Response } from "express";
import { AuthorizedRequest } from "../../../types";
import { CartProduct } from "../models";
import { isValidMongoId } from "../../../utils";
import { AppError } from "../../../classes";
import { CartModule } from "../..";
import { ClientSession } from "mongoose";

export const removeProductFromCartController = async (
  req: AuthorizedRequest,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const { id } = req.params;
  isValidMongoId(id, "Invalid Cart Product Id provided", 404);

  const cartProduct = await CartProduct.findById(id).session(session);
  if (!cartProduct) {
    throw new AppError("Cart product not found", 404);
  }

  const cart = await CartModule.Models.Cart.findByIdAndUpdate(
    cartProduct.cart,
    { $pull: { products: cartProduct._id } },
    { new: true, session }
  );

  if (!cart) {
    throw new AppError("Associated cart not found", 404);
  }

  await CartProduct.deleteOne({ _id: cartProduct._id }).session(session);

  res.success(200, "Product removed from cart successfully");
};
