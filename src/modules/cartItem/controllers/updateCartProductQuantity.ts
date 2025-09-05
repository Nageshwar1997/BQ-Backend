import { Response } from "express";
import { AuthorizedRequest } from "../../../types";
import { CartProduct } from "../models";
import { isValidMongoId } from "../../../utils";
import { AppError } from "../../../classes";

export const updateCartProductQuantityController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { id } = req.params;

  isValidMongoId(id, "Invalid Cart Product Id provided", 404);

  const { quantity } = req.body ?? {};

  const cartProduct = await CartProduct.findByIdAndUpdate(
    id,
    { $set: { quantity } },
    { new: true }
  );

  if (!cartProduct) {
    throw new AppError("Failed to update quantity", 400);
  }

  res.success(201, "Quantity updated successfully");
};
