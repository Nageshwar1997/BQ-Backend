import { Schema } from "mongoose";
import { ICart } from "../types";

export const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: { type: [{ type: Schema.Types.ObjectId, ref: "Cart-Product" }] },
    charges: { type: Number, min: 0 },
  },
  { timestamps: true, versionKey: false }
);
