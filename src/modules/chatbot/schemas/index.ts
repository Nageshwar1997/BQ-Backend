import { Schema, Types } from "mongoose";

export const productEmbeddingSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    embedding: { type: [Number], required: true },
    metadata: {
      searchText: { type: String, required: true },
    },
  },
  { versionKey: false }
);

// 🔹 Text index on the single searchText field
productEmbeddingSchema.index({ "metadata.searchText": "text" });
