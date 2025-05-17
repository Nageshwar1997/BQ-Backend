import { UploadApiResponse } from "cloudinary";

import { Configs, Types } from "../..";
import { Classes, Envs } from "../../../../common";

const mainFolder = Envs.CLOUDINARY_MAIN_FOLDER;

// ========== COMMON UPLOADER FUNCTION ==========
const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  cloudinaryConfigOption: Types.CloudinaryConfigOption
): Promise<UploadApiResponse> => {
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";

  const publicId = `${new Date()
    .toLocaleDateString()
    .replace(/\//g, "_")}_${Date.now()}_${file?.originalname
    .split(" ")
    .join("_")
    .split(".")
    .slice(0, -1)
    .join("")}`;

  const cloudinary = Configs.myCloudinary(cloudinaryConfigOption);

  return new Promise<UploadApiResponse>((resolve, reject) => {
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
              new Classes.AppError(
                error.message || "Failed to upload image on Cloudinary",
                500
              )
            );
          } else if (result) {
            resolve(result);
          } else {
            reject(
              new Classes.AppError("Failed to upload image on Cloudinary", 500)
            );
          }
        }
      )
      .end(file?.buffer);
  });
};

// ========== SINGLE IMAGE UPLOADER ==========
export const singleImageUploader = async ({
  file,
  folder = "",
  cloudinaryConfigOption = "image",
}: Types.SingleFileUploaderProps) => {
  try {
    const cloudinaryConnectionTest = await Configs.cloudinaryConnection(
      cloudinaryConfigOption
    );

    if (cloudinaryConnectionTest.error) {
      throw new Classes.AppError(cloudinaryConnectionTest.message, 500);
    }

    const result = await uploadToCloudinary(
      file,
      folder,
      cloudinaryConfigOption
    );
    return result;
  } catch (error) {
    throw new Classes.AppError(
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
}: Types.MultipleFileUploaderProps) => {
  try {
    const cloudinaryConnectionTest = await Configs.cloudinaryConnection(
      cloudinaryConfigOption
    );

    if (cloudinaryConnectionTest.error) {
      throw new Classes.AppError(cloudinaryConnectionTest.message, 500);
    }

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, folder, cloudinaryConfigOption)
    );

    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults; // Array of UploadApiResponse
  } catch (error) {
    throw new Classes.AppError(
      error instanceof Error
        ? error.message
        : "Unexpected error during multiple uploads",
      500
    );
  }
};
