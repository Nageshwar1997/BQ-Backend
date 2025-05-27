import { isValidObjectId, Types } from "mongoose";

export const isValidMongoId = (id: Types.ObjectId | string): boolean => {
  return isValidObjectId(id);
};

export const getCloudinaryOptimizedUrl = (url: string): string => {
  if (!url) return "";

  // Check if URL already has f_auto,q_auto
  if (url.includes("f_auto") || url.includes("q_auto")) {
    return url; // Already optimized
  }

  // Insert f_auto,q_auto after /upload/
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};
