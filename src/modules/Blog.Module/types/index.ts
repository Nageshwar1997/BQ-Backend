import { Types } from "mongoose";
import { ValidateZodFieldConfigs } from "../../../types";

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

export type TBlogFieldOnly =
  | "mainTitle"
  | "subTitle"
  | "content"
  | "description"
  | "publishedDate"
  | "author"
  | "tags";

export interface ValidateBlogFieldConfigs extends ValidateZodFieldConfigs {
  field: TBlogFieldOnly;
}
