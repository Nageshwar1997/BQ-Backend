import { Schema } from "mongoose";
import { TCartProduct } from "../types";

export const cartProductSchema = new Schema<TCartProduct>(
  {
    cart: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    shade: { type: Schema.Types.ObjectId, ref: "Shade" },
    quantity: { type: Number, required: true, min: 1, max: 5 },
  },
  { versionKey: false }
);
