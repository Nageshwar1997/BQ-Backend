import { BlogProps, BlogThumbnailType } from "../types";

export const BLOGS_THUMBNAILS: BlogThumbnailType[] = [
  "smallThumbnail",
  "largeThumbnail",
];

export const possibleEditBlogFields: (keyof BlogProps)[] = [
  "mainTitle",
  "subTitle",
  "author",
  "description",
  "content",
  "tags",
  "publishedDate",
];
