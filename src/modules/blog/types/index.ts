import { Types } from "mongoose";
import { ValidateZodFieldProps } from "../../../types";

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
  publisher: Types.ObjectId;
}

export type BlogThumbnailType = "smallThumbnail" | "largeThumbnail";

export interface ValidateBlogFieldProps extends ValidateZodFieldProps {
  field: keyof BlogProps;
}
