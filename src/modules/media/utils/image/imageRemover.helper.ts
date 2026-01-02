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
            new AppError(
              error.message || "Failed to remove image from Cloudinary",
              500
            )
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
    throw new AppError("Image URL is required", 400);
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const publicId = extractPublicId(imageUrl, "image");
    const result = await removeImageFromCloudinary(
      publicId,
      cloudinaryConfigOption
    );
    return result;
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Unexpected error during remove",
      500
    );
  }
};

// ========== MULTIPLE IMAGES REMOVER ==========
export const multipleImagesRemover = async (
  imageUrls: string[],
  cloudinaryConfigOption: CloudinaryConfigOption = "image"
) => {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new AppError("Image URLs are required", 400);
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );
  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const removePromises = imageUrls.map(async (url) => {
      const publicId = extractPublicId(url, "image");
      return removeImageFromCloudinary(publicId, cloudinaryConfigOption);
    });

    const removeResults = await Promise.all(removePromises);

    return removeResults; // Array of UploadApiResponse
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during multiple remove",
      500
    );
  }
};
