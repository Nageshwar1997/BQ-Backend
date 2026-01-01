import { UploadApiResponse } from "cloudinary";
import { AppError } from "../../../../classes";
import { CloudinaryConfigOption } from "../../types";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import { extractPublicId } from "../common";

// ========== COMMON VIDEO REMOVER FUNCTION ==========
const removeVideoFromCloudinary = async (
  publicId: string,
  cloudinaryConfigOption: CloudinaryConfigOption = "video"
): Promise<UploadApiResponse> => {
  const cloudinary = myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "video" },
      (error, result) => {
        if (error) {
          console.log("Failed to remove video from Cloudinary", error);
          return reject(
            new AppError(
              error.message || "Failed to remove video from Cloudinary",
              500
            )
          );
        }
        resolve(result);
      }
    );
  });
};

// ========== SINGLE VIDEO REMOVER ==========
export const singleVideoRemover = async (
  videoUrl: string,
  cloudinaryConfigOption: CloudinaryConfigOption = "video"
) => {
  if (!videoUrl) {
    throw new AppError("Video URL is required", 400);
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const publicId = extractPublicId(videoUrl, "video");
    const result = await removeVideoFromCloudinary(
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

// ========== MULTIPLE VIDEOS REMOVER ==========
export const multipleVideosRemover = async (
  videoUrls: string[],
  cloudinaryConfigOption: CloudinaryConfigOption = "image"
) => {
  if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
    throw new AppError("Video URLs are required", 400);
  }

  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );
  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const removePromises = videoUrls.map(async (url) => {
      const publicId = extractPublicId(url, "video");
      return removeVideoFromCloudinary(publicId, cloudinaryConfigOption);
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
