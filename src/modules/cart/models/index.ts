import { model } from "mongoose";
import { ICart } from "../types";
import { cartSchema } from "../schemas";

export const Cart = model<ICart>("Cart", cartSchema);
