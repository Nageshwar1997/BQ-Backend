import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";

import { SingleFileUploaderProps } from "../../types";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import { AppError } from "../../../../classes";
import { CLOUDINARY_MAIN_FOLDER } from "../../../../envs";

export const videoUploader = async ({
  file,
  folder = "",
  cloudinaryConfigOption = "video",
}: SingleFileUploaderProps) => {
  // Convert Buffer to Readable Stream
  const bufferStream = Readable.from(file.buffer);

  const mainFolder = CLOUDINARY_MAIN_FOLDER;
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";

  const publicId = `${new Date()
    .toLocaleDateString()
    .replace(/\//g, "_")}_${Date.now()}_${file?.originalname
    .split(" ")
    .join("_")
    .split(".")
    .slice(0, -1)
    .join("")}`;

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
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: `${mainFolder}/${subFolder}`,
          public_id: publicId,
          allowed_formats: ["mp4", "webm"],
          overwrite: true, // Replace existing video
          invalidate: true, // Clear cache
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
            reject(new AppError("Failed to upload video to Cloudinary", 500));
          }
        }
      );
      bufferStream.pipe(uploadStream);
    });
    return result;
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during upload video to Cloudinary",
      500
    );
  }
};
