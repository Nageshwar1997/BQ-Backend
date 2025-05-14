import { UploadApiResponse } from "cloudinary";

import { Shared } from "../../../../shared";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import { CloudinaryConfigOption } from "../../types";

// ========== COMMON REMOVER FUNCTION ==========
const removeFromCloudinary = async (
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
            new Shared.Classes.AppError(
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
    throw new Shared.Classes.AppError("Invalid Cloudinary image URL", 400);
  }

  return match[1];
};

// ========== SINGLE IMAGE REMOVER ==========
export const singleImageRemover = async (
  imageUrl: string,
  cloudinaryConfigOption: CloudinaryConfigOption = "image"
) => {
  if (!imageUrl) {
    throw new Shared.Classes.AppError("Image URL is required", 400);
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new Shared.Classes.AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const publicId = extractPublicId(imageUrl);
    const result = await removeFromCloudinary(publicId, cloudinaryConfigOption);
    return result;
  } catch (error) {
    throw new Shared.Classes.AppError(
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
    throw new Shared.Classes.AppError("Image URLs are required", 400);
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );
  if (cloudinaryConnectionTest.error) {
    throw new Shared.Classes.AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const removePromises = imageUrls.map(async (url) => {
      const publicId = extractPublicId(url);
      return removeFromCloudinary(publicId, cloudinaryConfigOption);
    });

    const removeResults = await Promise.all(removePromises);

    return removeResults; // Array of UploadApiResponse
  } catch (error) {
    throw new Shared.Classes.AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during multiple remove",
      500
    );
  }
};
