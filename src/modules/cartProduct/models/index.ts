import { model } from "mongoose";
import { cartProductSchema } from "../schemas";
import { TCartProduct } from "../types";

export const CartProduct = model<TCartProduct>(
  "Cart-Product",
  cartProductSchema
);
