import { Schema, Types } from "mongoose";
import { ReviewProps } from "../types";

const reviewSchema = new Schema<ReviewProps>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true, default: 1 },
    title: { type: String, trim: true, required: false },
    comment: { type: String, trim: true, required: false },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    likes: { type: [Types.ObjectId], default: [] },
    dislikes: { type: [Types.ObjectId], default: [] },
    helpful: { type: [Types.ObjectId], default: [] },
  },
  { timestamps: true, versionKey: false }
);
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: 1 });
reviewSchema.index({ images: 1 });
reviewSchema.index({ videos: 1 });
reviewSchema.index({ likes: 1 });
reviewSchema.index({ dislikes: 1 });

export default reviewSchema;
