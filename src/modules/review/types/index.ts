import { Types } from "mongoose";

export interface ReviewProps {
  rating: number;
  title: string;
  comment: string;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  images: string[];
  videos: string[];
}
