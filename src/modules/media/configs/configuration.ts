import { v2 as cloudinary } from "cloudinary";
import { CloudinaryConfigOption } from "../types";
import {
  CLOUDINARY_IMAGE_API_KEY,
  CLOUDINARY_IMAGE_API_SECRET,
  CLOUDINARY_IMAGE_CLOUD_NAME,
  CLOUDINARY_PRODUCT_API_KEY,
  CLOUDINARY_PRODUCT_API_SECRET,
  CLOUDINARY_PRODUCT_CLOUD_NAME,
  CLOUDINARY_VIDEO_API_KEY,
  CLOUDINARY_VIDEO_API_SECRET,
  CLOUDINARY_VIDEO_CLOUD_NAME,
} from "../../../envs";

export const myCloudinary = (
  isImageOrVideoOrProduct: CloudinaryConfigOption
) => {
  if (isImageOrVideoOrProduct === "image") {
    cloudinary.config({
      cloud_name: CLOUDINARY_IMAGE_CLOUD_NAME,
      api_key: CLOUDINARY_IMAGE_API_KEY,
      api_secret: CLOUDINARY_IMAGE_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideoOrProduct === "video") {
    cloudinary.config({
      cloud_name: CLOUDINARY_VIDEO_CLOUD_NAME,
      api_key: CLOUDINARY_VIDEO_API_KEY,
      api_secret: CLOUDINARY_VIDEO_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideoOrProduct === "product") {
    cloudinary.config({
      cloud_name: CLOUDINARY_PRODUCT_CLOUD_NAME,
      api_key: CLOUDINARY_PRODUCT_API_KEY,
      api_secret: CLOUDINARY_PRODUCT_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
};
