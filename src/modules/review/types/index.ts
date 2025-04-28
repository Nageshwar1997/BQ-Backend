import { Types } from "mongoose";

export interface ReviewProps {
  rating: number;
  review: string;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  images: string[];
}
