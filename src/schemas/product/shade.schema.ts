import { Schema } from "mongoose";
import { ShadeProps } from "../../types";

const productShadeSchema = new Schema<ShadeProps>({
  colorName: { type: String, required: true, trim: true },
  colorCode: { type: String, required: true, trim: true },
  shadeImages: [{ type: String }],
  stock: { type: Number, required: true, min: 1 },
});

export default productShadeSchema;
