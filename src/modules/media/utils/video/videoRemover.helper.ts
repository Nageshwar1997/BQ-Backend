import { UploadApiResponse } from "cloudinary";
import { AppError } from "../../../../classes";
import { CloudinaryConfigOption } from "../../types";
import { cloudinaryConnection, myCloudinary } from "../../configs";

// ========== HELPER: Extract publicId from Video URL ==========
const extractVideoPublicId = (videoUrl: string): string => {
  const regex = /\/v\d+\/(.+?)\.(mp4|webm|m3u8)$/;
  const match = videoUrl.match(regex);

  if (!match || !match[1]) {
    throw new AppError("Invalid Cloudinary video URL", 400);
  }

  return match[1];
};

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

  const publicId = extractVideoPublicId(videoUrl);
  const result = await removeVideoFromCloudinary(
    publicId,
    cloudinaryConfigOption
  );
  return result;
};

// ========== MULTIPLE VIDEOS REMOVER ==========
export const multipleVideosRemover = async (
  videoUrls: string[],
  cloudinaryConfigOption: CloudinaryConfigOption = "video"
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

  const removePromises = videoUrls.map(async (url) => {
    const publicId = extractVideoPublicId(url);
    return removeVideoFromCloudinary(publicId, cloudinaryConfigOption);
  });

  const removeResults = await Promise.all(removePromises);
  return removeResults; // Array of UploadApiResponse
};
