import { UploadApiResponse } from "cloudinary";

import { AppError } from "../../../../classes";
import { CloudinaryConfigOption } from "../../types";
import { cloudinaryConnection, myCloudinary } from "../../configs";

export const videoRemover = async (
  videoUrl: string,
  cloudinaryConfigOption: CloudinaryConfigOption = "video"
) => {
  if (!videoUrl) {
    throw new AppError("Video URL is required", 400);
  }

  // Updated regex to handle .mp4, .webm, and .m3u8
  const regex = /\/v\d+\/(.+?)\.(mp4|webm|m3u8)$/;
  const match = videoUrl.match(regex);

  if (!match || !match[1]) {
    throw new AppError("Invalid Cloudinary video URL", 400);
  }

  const publicId = match[1];

  // Cloudinary Connectivity Test
  const cloudinaryConnectionTest = await cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = myCloudinary(cloudinaryConfigOption);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
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

    return result;
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during video removal",
      500
    );
  }
};
