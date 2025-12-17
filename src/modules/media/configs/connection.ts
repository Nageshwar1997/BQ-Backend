import { CloudinaryConfigOption } from "../types";
import { myCloudinary } from "./configuration";

export const cloudinaryConnection = async (
  isImageOrVideoOrProduct: CloudinaryConfigOption
) => {
  try {
    const cloudinary = myCloudinary(isImageOrVideoOrProduct);

    const res = await cloudinary.api.ping();
    console.log(`Cloudinary ${isImageOrVideoOrProduct} Connected ✅`, res);
    return {
      success: true,
      error: false,
      message: `Cloudinary ${isImageOrVideoOrProduct} Connected ✅`,
    };
  } catch (err) {
    console.log(
      `Cloudinary ${isImageOrVideoOrProduct} Connection Error ❌`,
      err
    );
    return {
      success: false,
      error: true,
      message: `Cloudinary ${isImageOrVideoOrProduct} Connection Error ❌`,
    };
  }
};
