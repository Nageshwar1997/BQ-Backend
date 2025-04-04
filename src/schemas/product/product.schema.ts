import { Schema } from "mongoose";
import { ProductProps } from "../../types";

const productSchema = new Schema<ProductProps>(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    originalPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    howToUse: { type: String, trim: true },
    ingredients: { type: String, trim: true },
    additionalDetails: { type: String, trim: true },
    commonImages: {
      type: [String],
      default: [],
    },
    shades: [{ type: Schema.Types.ObjectId, ref: "Shade" }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // ratings: [{ type: Schema.Types.ObjectId, ref: "Rating" }],
    // reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // videos: [{ type: Schema.Types.ObjectId, ref: "ProductVideo" }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Unique index for title
productSchema.index({ title: 1 }, { unique: true });

// Indexing for performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ sellingPrice: 1 });

export default productSchema;
