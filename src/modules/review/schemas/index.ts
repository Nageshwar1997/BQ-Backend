import { Schema } from "mongoose";
import { ReviewProps } from "../types";

const reviewSchema = new Schema<ReviewProps>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true, default: 1 },
    title: { type: String, trim: true, required: false },
    comment: { type: String, trim: true, required: false },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: 1 });

export default reviewSchema;
