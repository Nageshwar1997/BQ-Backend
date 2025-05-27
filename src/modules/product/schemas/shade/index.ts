import { Schema } from "mongoose";
import { ShadeProps } from "../../types";

export const productShadeSchema = new Schema<ShadeProps>(
  {
    shadeName: { type: String, required: true, trim: true },
    colorCode: { type: String, required: true, trim: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 1 },
  },
  { versionKey: false, timestamps: true }
);
