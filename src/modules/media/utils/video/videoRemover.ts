import { UploadApiResponse } from "cloudinary";
import { Configs, Types } from "../..";
import { Classes } from "../../../../common";

export const videoRemover = async (
  videoUrl: string,
  cloudinaryConfigOption: Types.CloudinaryConfigOption = "video"
) => {
  if (!videoUrl) {
    throw new Classes.AppError("Video URL is required", 400);
  }

  // Updated regex to handle .mp4, .webm, and .m3u8
  const regex = /\/v\d+\/(.+?)\.(mp4|webm|m3u8)$/;
  const match = videoUrl.match(regex);

  if (!match || !match[1]) {
    throw new Classes.AppError("Invalid Cloudinary video URL", 400);
  }

  const publicId = match[1];

  // Cloudinary Connectivity Test
  const cloudinaryConnectionTest = await Configs.cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new Classes.AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = Configs.myCloudinary(cloudinaryConfigOption);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: "video" },
        (error, result) => {
          if (error) {
            return reject(
              new Classes.AppError(
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
    throw new Classes.AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during video removal",
      500
    );
  }
};
