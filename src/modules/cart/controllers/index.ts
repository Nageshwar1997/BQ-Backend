import { Response } from "express";
import { getUserCart } from "../services/getUserCart";
import { AuthenticatedRequest } from "../../../types";

export const getCartController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const cart = await getUserCart(req);

  res.success(200, "Cart fetched successfully", { cart });
};
