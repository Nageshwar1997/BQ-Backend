import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";

import {
  CloudinaryConfigOption,
  MultipleFileUploaderProps,
  SingleFileUploaderProps,
} from "../../types";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import { AppError } from "../../../../classes";
import { getSafeFolderName, getSafePublicId } from "../common";

// ========== COMMON VIDEO UPLOADER FUNCTION ==========
const uploadVideoToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  cloudinaryConfigOption: CloudinaryConfigOption
): Promise<UploadApiResponse & { playback_url: string }> => {
  const bufferStream = Readable.from(file.buffer);

  const cloudinary = myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse & { playback_url: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: getSafeFolderName(folder),
          public_id: getSafePublicId(file.originalname),
          allowed_formats: ["mp4", "webm"],
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(
                error.message || "Failed to upload video to Cloudinary",
                500
              )
            );
          } else if (result) {
            // Always return playback_url (fallback to secure_url)
            const playback_url = result.playback_url || result.secure_url;
            resolve({ ...result, playback_url });
          } else {
            reject(new AppError("Unknown error during video upload", 500));
          }
        }
      );

      bufferStream.pipe(uploadStream);
    }
  );
};

// ========== SINGLE VIDEO UPLOADER ==========
export const singleVideoUploader = async ({
  file,
  folder = "",
  cloudinaryConfigOption = "video",
}: SingleFileUploaderProps) => {
  const connectionTest = await cloudinaryConnection(cloudinaryConfigOption);
  if (connectionTest.error) {
    throw new AppError(connectionTest.message, 500);
  }

  return uploadVideoToCloudinary(file, folder, cloudinaryConfigOption);
};

// ========== MULTIPLE VIDEOS UPLOADER ==========
export const multipleVideosUploader = async ({
  files,
  folder = "",
  cloudinaryConfigOption = "video",
}: MultipleFileUploaderProps) => {
  const connectionTest = await cloudinaryConnection(cloudinaryConfigOption);
  if (connectionTest.error) {
    throw new AppError(connectionTest.message, 500);
  }

  const uploadPromises = files.map((file) =>
    uploadVideoToCloudinary(file, folder, cloudinaryConfigOption)
  );

  const result = await Promise.all(uploadPromises);

  return result; // Array of UploadApiResponse
};
