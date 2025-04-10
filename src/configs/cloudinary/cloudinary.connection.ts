import { CloudinaryConfigOption } from "../../types";
import myCloudinary from "./cloudinary.config";

const cloudinaryConnection = async (
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
    console.error(
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

export default cloudinaryConnection;
