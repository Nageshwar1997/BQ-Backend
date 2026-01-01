import { UploadApiResponse } from "cloudinary";

import { AppError } from "../../../../classes";
import { cloudinaryConnection, myCloudinary } from "../../configs";
import {
  CloudinaryConfigOption,
  MultipleFileUploaderProps,
  SingleFileUploaderProps,
} from "../../types";
import { getCloudinaryOptimizedUrl } from "../../../../utils";
import { getSafeFolderName, getSafePublicId } from "../common";

// ========== COMMON IMAGE UPLOADER FUNCTION ==========
const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  cloudinaryConfigOption: CloudinaryConfigOption
): Promise<UploadApiResponse> => {
  const cloudinary = myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: getSafeFolderName(folder),
        public_id: getSafePublicId(file.originalname),
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
        format: "webp", // convert to webp
        transformation: [{ fetch_format: "webp", quality: "auto" }],
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
          const optimizedUrl = getCloudinaryOptimizedUrl(result.secure_url);
          resolve({ ...result, secure_url: optimizedUrl });
        } else {
          reject(new AppError("Failed to upload image on Cloudinary", 500));
        }
      }
    );

    // End the stream with buffer
    stream.end(file.buffer);
  });
};

// ========== SINGLE IMAGE UPLOADER ==========
export const singleImageUploader = async ({
  file,
  folder = "",
  cloudinaryConfigOption = "image",
}: SingleFileUploaderProps) => {
  try {
    const cloudinaryConnectionTest = await cloudinaryConnection(
      cloudinaryConfigOption
    );

    if (cloudinaryConnectionTest.error) {
      throw new AppError(cloudinaryConnectionTest.message, 500);
    }

    const result = await uploadImageToCloudinary(
      file,
      folder,
      cloudinaryConfigOption
    );
    return result;
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Unexpected error during upload",
      500
    );
  }
};

// ========== MULTIPLE IMAGES UPLOADER ==========
export const multipleImagesUploader = async ({
  files,
  folder = "",
  cloudinaryConfigOption = "image",
}: MultipleFileUploaderProps) => {
  try {
    const cloudinaryConnectionTest = await cloudinaryConnection(
      cloudinaryConfigOption
    );

    if (cloudinaryConnectionTest.error) {
      throw new AppError(cloudinaryConnectionTest.message, 500);
    }

    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file, folder, cloudinaryConfigOption)
    );

    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults; // Array of UploadApiResponse
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during multiple uploads",
      500
    );
  }
};
