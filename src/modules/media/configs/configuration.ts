import { v2 as cloudinary } from "cloudinary";

import { Types } from "..";
import { Envs } from "../../../common";

export const myCloudinary = (
  isImageOrVideoOrProduct: Types.CloudinaryConfigOption
) => {
  if (isImageOrVideoOrProduct === "image") {
    cloudinary.config({
      cloud_name: Envs.CLOUDINARY_IMAGE_CLOUD_NAME,
      api_key: Envs.CLOUDINARY_IMAGE_API_KEY,
      api_secret: Envs.CLOUDINARY_IMAGE_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideoOrProduct === "video") {
    cloudinary.config({
      cloud_name: Envs.CLOUDINARY_VIDEO_CLOUD_NAME,
      api_key: Envs.CLOUDINARY_VIDEO_API_KEY,
      api_secret: Envs.CLOUDINARY_VIDEO_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideoOrProduct === "product") {
    cloudinary.config({
      cloud_name: Envs.CLOUDINARY_PRODUCT_CLOUD_NAME,
      api_key: Envs.CLOUDINARY_PRODUCT_API_KEY,
      api_secret: Envs.CLOUDINARY_PRODUCT_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
};
