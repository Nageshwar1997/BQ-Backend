import { Schema } from "mongoose";
import { ICart } from "../types";

export const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        shade: { type: Schema.Types.ObjectId, ref: "Shade" },
        totalPrice: { type: Number, required: true, min: 1 },
        quantity: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);
