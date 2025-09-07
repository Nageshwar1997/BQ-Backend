import { model } from "mongoose";
import { cartItemSchema } from "../schemas";
import { TCartProduct } from "../types";

export const CartProduct = model<TCartProduct>("Cart-Product", cartItemSchema);
