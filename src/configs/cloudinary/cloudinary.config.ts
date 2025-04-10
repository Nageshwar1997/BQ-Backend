import { v2 as cloudinary } from "cloudinary";

const myCloudinary = (
  isImageOrVideoOrProduct: "image" | "video" | "product"
) => {
  if (isImageOrVideoOrProduct === "image") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_IMAGE_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_IMAGE_API_KEY,
      api_secret: process.env.CLOUDINARY_IMAGE_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideoOrProduct === "video") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_VIDEO_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_VIDEO_API_KEY,
      api_secret: process.env.CLOUDINARY_VIDEO_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideoOrProduct === "product") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_PRODUCT_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_PRODUCT_API_KEY,
      api_secret: process.env.CLOUDINARY_PRODUCT_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
};

export default myCloudinary;
