import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { CartModule } from "../..";
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
    throw new AppError("User or product information missing", 400);
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);

  const cart = await CartModule.Models.Cart.findOneAndUpdate(
    { user: userId },
    { $push: { products: { productId, shade: shadeId ?? null } } },
    { new: true, upsert: true } // If cart not found, create a new one
  );

  res.success(200, "Product added to cart successfully", { cart });
};
