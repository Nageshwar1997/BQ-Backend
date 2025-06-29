import { Types } from "mongoose";

export interface ReviewProps {
  rating: number;
  title: string;
  comment: string;
  product: Types.ObjectId;
  user: Types.ObjectId;
  images: string[];
  videos: string[];
}
