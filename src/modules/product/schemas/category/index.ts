import { Schema } from "mongoose";
import { CategoryProps } from "../../types";

export const categorySchema = new Schema<CategoryProps>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    level: { type: Number, required: true, default: 1 },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    }, // Self-reference
  },
  { versionKey: false, timestamps: true }
);

// Indexing for faster queries
categorySchema.index({ name: 1 });
categorySchema.index({ category: 1 });
categorySchema.index({ parentCategory: 1 });
