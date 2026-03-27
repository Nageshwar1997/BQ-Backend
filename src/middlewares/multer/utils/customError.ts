import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE,
  MB,
} from "../../../constants";
import { CustomFileErrorProps } from "../../../types";

export const getCustomError = ({
  files,
  customLimits,
  customFileTypes,
}: CustomFileErrorProps) => {
  const fieldErrors: Record<string, string[]> = {};
  const globalErrors: string[] = [];

  const pushFieldError = (field: string, message: string) => {
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(message);
  };

  // Limits
  const imageSizeLimit = customLimits?.imageSize ?? MAX_IMAGE_FILE_SIZE;
  const videoSizeLimit = customLimits?.videoSize ?? MAX_VIDEO_FILE_SIZE;
  const otherSizeLimit = customLimits?.otherSize ?? 2 * MB;

  // Types
  const allowedImageTypes = customFileTypes?.imageTypes ?? ALLOWED_IMAGE_TYPES;
  const allowedVideoTypes = customFileTypes?.videoTypes ?? ALLOWED_VIDEO_TYPES;
  const allowedOtherTypes = customFileTypes?.otherTypes ?? [];

  if (files && files.length > 0) {
    for (const file of files) {
      const { originalname, fieldname, size, mimetype } = file;

      const isImage = allowedImageTypes.includes(mimetype);
      const isVideo = allowedVideoTypes.includes(mimetype);
      const isOther = allowedOtherTypes.includes(mimetype);

      const fileSizeMB = (size / MB).toFixed(2);

      let allowedSizeMB = "0";
      let fileType = "file";

      if (isImage) {
        allowedSizeMB = (imageSizeLimit / MB).toFixed(2);
        fileType = "image";
      } else if (isVideo) {
        allowedSizeMB = (videoSizeLimit / MB).toFixed(2);
        fileType = "video";
      } else if (isOther) {
        allowedSizeMB = (otherSizeLimit / MB).toFixed(2);
        fileType = "file";
      }

      // 🔥 SIZE VALIDATION
      if (isImage && size > imageSizeLimit) {
        pushFieldError(
          fieldname,
          `Image '${originalname}' is too large (${fileSizeMB}MB). Max allowed: ${allowedSizeMB}MB.`,
        );
        continue;
      }

      if (isVideo && size > videoSizeLimit) {
        pushFieldError(
          fieldname,
          `Video '${originalname}' is too large (${fileSizeMB}MB). Max allowed: ${allowedSizeMB}MB.`,
        );
        continue;
      }

      if (isOther && size > otherSizeLimit) {
        pushFieldError(
          fieldname,
          `File '${originalname}' is too large (${fileSizeMB}MB). Max allowed: ${allowedSizeMB}MB.`,
        );
        continue;
      }

      // 🔥 TYPE VALIDATION
      if (!isImage && !isVideo && !isOther) {
        const allowedTypes = [
          ...allowedImageTypes,
          ...allowedVideoTypes,
          ...allowedOtherTypes,
        ]
          .map((type) => type.split("/")[1])
          .join(", ");
        pushFieldError(
          fieldname,
          `File '${originalname}' has invalid type '${mimetype}'. Allowed: [${allowedTypes}].`,
        );
      }
    }
  }

  return {
    fieldErrors,
    globalErrors,
  };
};
