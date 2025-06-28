import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";

import {
  CloudinaryConfigOption,
  MultipleFileUploaderProps,
  SingleFileUploaderProps,
} from "../../types";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import { AppError } from "../../../../classes";
import { CLOUDINARY_MAIN_FOLDER } from "../../../../envs";

const mainFolder = CLOUDINARY_MAIN_FOLDER;

// ========== COMMON VIDEO UPLOADER FUNCTION ==========
const uploadVideoToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  cloudinaryConfigOption: CloudinaryConfigOption
): Promise<UploadApiResponse> => {
  const bufferStream = Readable.from(file.buffer);
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";

  const publicId = `${new Date()
    .toLocaleDateString()
    .replace(/\//g, "-")}_${Date.now()}_${file?.originalname
    .split(" ")
    .join("_")
    .split(".")
    .slice(0, -1)
    .join("")}`;

  const cloudinary = myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: `${mainFolder}/${subFolder}`,
        public_id: publicId,
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
          resolve(result);
        } else {
          reject(new AppError("Unknown error during video upload", 500));
        }
      }
    );

    bufferStream.pipe(uploadStream);
  });
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
