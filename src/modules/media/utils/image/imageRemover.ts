import { UploadApiResponse } from "cloudinary";

import { Configs, Types } from "../..";
import { Classes } from "../../../../common";

// ========== COMMON REMOVER FUNCTION ==========
const removeFromCloudinary = async (
  publicId: string,
  cloudinaryConfigOption: Types.CloudinaryConfigOption = "image"
): Promise<UploadApiResponse> => {
  const cloudinary = Configs.myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.log("Failed to remove image from Cloudinary", error);
          return reject(
            new Classes.AppError(
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

// ========== HELPER: Extract publicId from URL ==========
const extractPublicId = (imageUrl: string): string => {
  const regex = /\/v\d+\/(.+?)\.(jpg|jpeg|png|webp)$/;
  const match = imageUrl.match(regex);

  if (!match || !match[1]) {
    throw new Classes.AppError("Invalid Cloudinary image URL", 400);
  }

  return match[1];
};

// ========== SINGLE IMAGE REMOVER ==========
export const singleImageRemover = async (
  imageUrl: string,
  cloudinaryConfigOption: Types.CloudinaryConfigOption = "image"
) => {
  if (!imageUrl) {
    throw new Classes.AppError("Image URL is required", 400);
  }

  const cloudinaryConnectionTest = await Configs.cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new Classes.AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const publicId = extractPublicId(imageUrl);
    const result = await removeFromCloudinary(publicId, cloudinaryConfigOption);
    return result;
  } catch (error) {
    throw new Classes.AppError(
      error instanceof Error ? error.message : "Unexpected error during remove",
      500
    );
  }
};

// ========== MULTIPLE IMAGES REMOVER ==========
export const multipleImagesRemover = async (
  imageUrls: string[],
  cloudinaryConfigOption: Types.CloudinaryConfigOption = "image"
) => {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Classes.AppError("Image URLs are required", 400);
  }

  const cloudinaryConnectionTest = await Configs.cloudinaryConnection(
    cloudinaryConfigOption
  );
  if (cloudinaryConnectionTest.error) {
    throw new Classes.AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const removePromises = imageUrls.map(async (url) => {
      const publicId = extractPublicId(url);
      return removeFromCloudinary(publicId, cloudinaryConfigOption);
    });

    const removeResults = await Promise.all(removePromises);

    return removeResults; // Array of UploadApiResponse
  } catch (error) {
    throw new Classes.AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during multiple remove",
      500
    );
  }
};
