import { v2 as cloudinary } from "cloudinary";

const myCloudinary = (isImageOrVideo: "image" | "video") => {
  if (isImageOrVideo === "image") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_IMAGE_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_IMAGE_API_KEY,
      api_secret: process.env.CLOUDINARY_IMAGE_API_SECRET,
      secure: true,
    });
  } else if (isImageOrVideo === "video") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_VIDEO_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_VIDEO_API_KEY,
      api_secret: process.env.CLOUDINARY_VIDEO_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
};

export default myCloudinary;
