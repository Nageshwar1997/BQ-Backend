import { Request } from "express";
import { Document, Schema } from "mongoose";

export type CloudinaryConfigOption = "image" | "video" | "product";
export interface FileUploaderProps {
  file: Express.Multer.File;
  folder?: string;
  cloudinaryConfigOption: CloudinaryConfigOption;
}

export type UserRoleType = "USER" | "SELLER" | "ADMIN" | "MASTER";

export interface UserProps extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRoleType;
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

export interface BlogProps {
  mainTitle: string;
  subTitle: string;
  author: string;
  description: string;
  content: string;
  tags: string[];
  publishedDate: Date;
  smallThumbnail: string;
  largeThumbnail: string;
  publisher: Schema.Types.ObjectId;
}

export interface HomeVideoProps {
  title: string;
  m3u8Url: string;
  originalUrl: string;
  posterUrl: string;
  public_id: string;
  duration: number;
  user: Schema.Types.ObjectId;
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
  shadeName: string;
  images: string[];
  stock: number;
}

export interface CategoryProps {
  name: string;
  level: number;
  parentCategory?: Schema.Types.ObjectId | null;
}

export interface ProductProps {
  title: string;
  brand: string;
  originalPrice: number;
  sellingPrice: number;
  discount: number;
  description: string;
  howToUse: string;
  ingredients?: string;
  additionalDetails?: string;
  commonImages: string[];
  shades?: ShadeProps[];
  category: Schema.Types.ObjectId;
  seller: Schema.Types.ObjectId;
  ratings: Schema.Types.ObjectId[];
  reviews: Schema.Types.ObjectId[];
  videos?: ProductVideoProps[];
}
