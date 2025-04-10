import { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import myCloudinary from "../configs/cloudinary/cloudinary.config";
import cloudinaryConnection from "../configs/cloudinary/cloudinary.connection";
import { AppError } from "../constructors";
import { FileUploaderProps } from "../types";

// Function to handle profile picture upload to Cloudinary
const imageUploader = async ({ file, folder = "" }: FileUploaderProps) => {
  const mainFolder = process.env.CLOUDINARY_MAIN_FOLDER;
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";

  const publicId = `${Date.now().toString()}_${file?.originalname
    .split(" ")
    .join("_")
    .split(".")
    .slice(0, -1)
    .join("")}`;

  // Cloudinary Connectivity Test
  const cloudinaryConnectionTest = await cloudinaryConnection("image");

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = myCloudinary("image");

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${mainFolder}/${subFolder}`,
            public_id: publicId,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
          },
          (error, result) => {
            if (error) {
              return reject(
                new AppError(
                  error.message || "Failed to upload image on Cloudinary",
                  500
                )
              );
            } else if (result) {
              resolve(result);
            } else {
              reject(new AppError("Failed to upload image on Cloudinary", 500));
            }
          }
        )
        .end(file?.buffer); // Upload the file buffer to Cloudinary
    });

    return result; // Return the result object
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Unexpected error during upload",
      500
    );
  }
};

const imageRemover = async (imageUrl: string) => {
  if (!imageUrl) {
    throw new AppError("Image URL is required", 400);
  }

  // Extract publicId from the image URL
  const regex = /\/v\d+\/(.+?)\.(jpg|jpeg|png|webp)$/;
  const match = imageUrl.match(regex);

  if (!match || !match[1]) {
    throw new AppError("Invalid Cloudinary image URL", 400);
  }

  const publicId = match[1];

  // Cloudinary Connectivity Test
  const cloudinaryConnectionTest = await cloudinaryConnection("image");

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = myCloudinary("image");

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(
            new AppError(
              error.message || "Failed to remove image from Cloudinary",
              500
            )
          );
        }
        resolve(result);
      });
    });

    return result;
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Unexpected error during remove",
      500
    );
  }
};

const videoUploader = async ({ file, folder = "" }: FileUploaderProps) => {
  // Convert Buffer to Readable Stream
  const bufferStream = Readable.from(file.buffer);

  const mainFolder = process.env.CLOUDINARY_MAIN_FOLDER;
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";

  const public_id = `${Date.now().toString()}_${file?.originalname
    .split(" ")
    .join("_")
    .split(".")
    .slice(0, -1)
    .join("")}`;

  // Cloudinary Connectivity Test
  const cloudinaryConnectionTest = await cloudinaryConnection("video");

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = myCloudinary("video");
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: `${mainFolder}/${subFolder}`,
          public_id,
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

const videoRemover = async (videoUrl: string) => {
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
  const cloudinaryConnectionTest = await cloudinaryConnection("video");

  if (cloudinaryConnectionTest.error) {
    throw new AppError(cloudinaryConnectionTest.message, 500);
  }

  try {
    const cloudinary = myCloudinary("video");

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

export { imageUploader, imageRemover, videoUploader, videoRemover };
