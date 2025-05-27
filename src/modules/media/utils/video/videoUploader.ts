import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";
import { Configs, Types } from "../..";
import { Classes, Envs } from "../../../../common";

export const videoUploader = async ({
  file,
  folder = "",
  cloudinaryConfigOption = "video",
}: Types.SingleFileUploaderProps) => {
  // Convert Buffer to Readable Stream
  const bufferStream = Readable.from(file.buffer);

  const mainFolder = Envs.CLOUDINARY_MAIN_FOLDER;
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
  const cloudinaryConnectionTest = await Configs.cloudinaryConnection(
    cloudinaryConfigOption
  );

  if (cloudinaryConnectionTest.error) {
    throw new Classes.AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = Configs.myCloudinary(cloudinaryConfigOption);
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
              new Classes.AppError(
                error.message || "Failed to upload video to Cloudinary",
                500
              )
            );
          } else if (result) {
            resolve(result);
          } else {
            reject(
              new Classes.AppError("Failed to upload video to Cloudinary", 500)
            );
          }
        }
      );
      bufferStream.pipe(uploadStream);
    });
    return result;
  } catch (error) {
    throw new Classes.AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during upload video to Cloudinary",
      500
    );
  }
};
