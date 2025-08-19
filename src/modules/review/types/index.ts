import { Types } from "mongoose";
import { UserModule } from "../..";

export interface ReviewProps {
  _id: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  product: Types.ObjectId;
  user: Types.ObjectId;
  images: string[];
  videos: string[];
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  helpful: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewPopulateFieldsProps {
  user: (keyof UserModule.Types.UserProps)[];
}
