import { model } from "mongoose";
import { ReviewProps } from "../types";
import reviewSchema from "../schemas";

export const Review = model<ReviewProps>("Review", reviewSchema);
