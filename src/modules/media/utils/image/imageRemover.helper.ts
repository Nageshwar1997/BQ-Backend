import { UploadApiResponse } from "cloudinary";

import { AppError } from "../../../../classes";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import { CloudinaryConfigOption } from "../../types";
import { extractPublicId } from "../common";

// ========== COMMON REMOVER FUNCTION ==========
const removeImageFromCloudinary = async (
  publicId: string,
  cloudinaryConfigOption: CloudinaryConfigOption = "image"
): Promise<UploadApiResponse> => {
  const cloudinary = myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.log("Failed to remove image from Cloudinary", error);
          return reject(
            new AppError({
              message: error.message || "Failed to remove image from Cloudinary",
              statusCode: 500,
              code: "INTERNAL_ERROR",
            })
          );
        }
        resolve(result);
      }
    );
  });
};

// ========== SINGLE IMAGE REMOVER ==========
export const singleImageRemover = async (
  imageUrl: string,
  cloudinaryConfigOption: CloudinaryConfigOption = "image"
) => {
  if (!imageUrl) {
    throw new AppError({ message: "Image URL is required", statusCode: 400 });
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new AppError({ message: cloudinaryConnectionTest.message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  try {
    const publicId = extractPublicId(imageUrl, "image");
    const result = await removeImageFromCloudinary(
      publicId,
      cloudinaryConfigOption
    );
    return result;
  } catch (error) {
    throw new AppError({
      message: error instanceof Error ? error.message : "Unexpected error during remove",
      statusCode: 500,
      code: "INTERNAL_ERROR",
    });
  }
};

// ========== MULTIPLE IMAGES REMOVER ==========
export const multipleImagesRemover = async (
  imageUrls: string[],
  cloudinaryConfigOption: CloudinaryConfigOption = "image"
) => {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new AppError({ message: "Image URLs are required", statusCode: 400 });
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );
  if (cloudinaryConnectionTest.error) {
    throw new AppError({ message: cloudinaryConnectionTest.message, statusCode: 500, code: "INTERNAL_ERROR" });
  }

  try {
    const removePromises = imageUrls.map(async (url) => {
      const publicId = extractPublicId(url, "image");
      return removeImageFromCloudinary(publicId, cloudinaryConfigOption);
    });

    const removeResults = await Promise.all(removePromises);

    return removeResults; // Array of UploadApiResponse
  } catch (error) {
    throw new AppError({
      message: error instanceof Error ? error.message : "Unexpected error during multiple remove",
      statusCode: 500,
      code: "INTERNAL_ERROR",
    });
  }
};
