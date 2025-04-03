import { Request } from "express";
import { Document, Schema } from "mongoose";

export interface FileUploaderProps {
  file: Express.Multer.File;
  folder?: string;
}

export interface UserProps extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "USER" | "SELLER" | "ADMIN" | "MASTER";
  profilePic?: string;
}

// Interface for authenticated requests with user
export interface AuthenticatedRequest extends Request {
  user?: Omit<UserProps, "password">; // User object without password
}

// Interface for authenticated requests with user
export interface AuthorizedRequest extends Request {
  user?: Omit<UserProps, "password">; // User object without password
}

interface ProductVideoProps {
  title: string;
  m3u8Url: string;
  originalUrl: string;
  thumbnail: string;
  public_id: string;
}

export interface ShadeProps {
  colorCode: string;
  colorName: string;
  shadeImages: string[];
  stock: number;
}

export interface ProductProps {
  title: string;
  brand: string;
  originalPrice: number;
  sellingPrice: number;
  discount: number;
  description: string;
  howToUse: string;
  ingredients: string;
  additionalDetails: string;
  commonImages: string[];
  shades: ShadeProps[];
  category: Schema.Types.ObjectId;
  seller: Schema.Types.ObjectId;
  ratings: Schema.Types.ObjectId[];
  reviews: Schema.Types.ObjectId[];
  videos: ProductVideoProps[];
}
