import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE,
  MB,
} from "../../../constants";
import { ErrorBuilder } from "../../../classes";
import { CustomFileErrorProps } from "../../../types";

export const getCustomError = ({
  files = [],
  customLimits,
  customFileTypes,
}: CustomFileErrorProps) => {
  const error = new ErrorBuilder();

  // Limits
  const imageSizeLimit = customLimits?.imageSize ?? MAX_IMAGE_FILE_SIZE;
  const videoSizeLimit = customLimits?.videoSize ?? MAX_VIDEO_FILE_SIZE;
  const otherSizeLimit = customLimits?.otherSize ?? 2 * MB;

  // Types
  const allowedImageTypes = customFileTypes?.imageTypes ?? ALLOWED_IMAGE_TYPES;
  const allowedVideoTypes = customFileTypes?.videoTypes ?? ALLOWED_VIDEO_TYPES;
  const allowedOtherTypes = customFileTypes?.otherTypes ?? [];

  for (const file of files) {
    const { originalname, fieldname, size, mimetype } = file;

    const isImage = allowedImageTypes.includes(mimetype);
    const isVideo = allowedVideoTypes.includes(mimetype);
    const isOther = allowedOtherTypes.includes(mimetype);

    const fileSizeMB = (size / MB).toFixed(2);

    let allowedSizeMB = "0";

    if (isImage) allowedSizeMB = (imageSizeLimit / MB).toFixed(2);
    else if (isVideo) allowedSizeMB = (videoSizeLimit / MB).toFixed(2);
    else if (isOther) allowedSizeMB = (otherSizeLimit / MB).toFixed(2);

    // SIZE VALIDATION
    if (isImage && size > imageSizeLimit) {
      error.addField(
        fieldname,
        `Image '${originalname}' too large (${fileSizeMB}MB). Max: ${allowedSizeMB}MB.`,
      );
      continue;
    }

    if (isVideo && size > videoSizeLimit) {
      error.addField(
        fieldname,
        `Video '${originalname}' too large (${fileSizeMB}MB).`,
      );
      continue;
    }

    if (isOther && size > otherSizeLimit) {
      error.addField(fieldname, `File '${originalname}' too large.`);
      continue;
    }

    // TYPE VALIDATION
    if (!isImage && !isVideo && !isOther) {
      const allowedTypes = [
        ...allowedImageTypes,
        ...allowedVideoTypes,
        ...allowedOtherTypes,
      ]
        .map((t) => t.split("/")[1])
        .join(", ");

      error.addField(
        fieldname,
        `File '${originalname}' has invalid type '${mimetype}'. Allowed: [${allowedTypes}]`,
      );
    }
  }

  return error.build();
};
