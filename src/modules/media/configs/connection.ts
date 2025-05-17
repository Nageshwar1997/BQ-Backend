import { Configs, Types } from "..";

export const cloudinaryConnection = async (
  isImageOrVideoOrProduct: Types.CloudinaryConfigOption
) => {
  try {
    const cloudinary = Configs.myCloudinary(isImageOrVideoOrProduct);

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
