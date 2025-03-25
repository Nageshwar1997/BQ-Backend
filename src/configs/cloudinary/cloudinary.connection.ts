import myCloudinary from "./cloudinary.config";

const cloudinaryConnection = async (isImageOrVideo: "image" | "video") => {
  try {
    const cloudinary = myCloudinary(isImageOrVideo);

    const res = await cloudinary.api.ping();
    console.log(`Cloudinary ${isImageOrVideo} Connected ✅`, res);
    return {
      success: true,
      error: false,
      message: `Cloudinary ${isImageOrVideo} Connected ✅`,
    };
  } catch (err) {
    console.error(`Cloudinary ${isImageOrVideo} Connection Error ❌`, err);
    return {
      success: false,
      error: true,
      message: `Cloudinary ${isImageOrVideo} Connection Error ❌`,
    };
  }
};

export default cloudinaryConnection;
