import { Schema } from "mongoose";
import { ProductProps } from "../../types";

const productSchema = new Schema<ProductProps>(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    originalPrice: { type: Number, required: true, min: 1, default: 1 },
    sellingPrice: { type: Number, required: true, min: 1, default: 1 },
    discount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    howToUse: { type: String, trim: true, default: "" },
    ingredients: { type: String, trim: true, default: "" },
    additionalDetails: { type: String, trim: true, default: "" },
    commonImages: {
      type: [String],
      default: [],
    },
    shades: [{ type: Schema.Types.ObjectId, ref: "Shade" }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviews: {
      type: [{ type: Schema.Types.ObjectId, ref: "Review" }],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

productSchema.index({ title: 1 });

// Indexing for performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ sellingPrice: 1 });

export default productSchema;
