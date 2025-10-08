import { Schema } from "mongoose";
import { TCartProduct } from "../types";

export const cartProductBaseFields = {
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  shade: { type: Schema.Types.ObjectId, ref: "Shade", default: null },
  quantity: { type: Number, required: true, min: 1, max: 5 },
};

export const cartProductSchema = new Schema<TCartProduct>(
  {
    ...cartProductBaseFields,
    cart: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
  },
  { versionKey: false, timestamps: true }
);
