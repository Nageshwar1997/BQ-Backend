import { Constants } from "../../../Constants";
import { ErrorBuilder } from "../../../Classes";
import { CustomFileErrorProps } from "../../../types";

export const CustomErrorUtil = ({
  files = [],
  customLimits,
  customFileTypes,
}: CustomFileErrorProps) => {
  const error = new ErrorBuilder();

  // Limits
  const imageSizeLimit =
    customLimits?.imageSize ?? Constants.File.MAX_IMAGE_FILE_SIZE;
  const videoSizeLimit =
    customLimits?.videoSize ?? Constants.File.MAX_VIDEO_FILE_SIZE;
  const otherSizeLimit = customLimits?.otherSize ?? 2 * Constants.File.MB;

  // Types
  const allowedImageTypes =
    customFileTypes?.imageTypes ?? Constants.File.ALLOWED_IMAGE_TYPES;
  const allowedVideoTypes =
    customFileTypes?.videoTypes ?? Constants.File.ALLOWED_VIDEO_TYPES;
  const allowedOtherTypes = customFileTypes?.otherTypes ?? [];

  for (const file of files) {
    const { originalname, fieldname, size, mimetype } = file;

    const isImage = allowedImageTypes.includes(mimetype);
    const isVideo = allowedVideoTypes.includes(mimetype);
    const isOther = allowedOtherTypes.includes(mimetype);

    const fileSizeMB = (size / Constants.File.MB).toFixed(2);

    let allowedSizeMB = "0";

    if (isImage)
      allowedSizeMB = (imageSizeLimit / Constants.File.MB).toFixed(2);
    else if (isVideo)
      allowedSizeMB = (videoSizeLimit / Constants.File.MB).toFixed(2);
    else if (isOther)
      allowedSizeMB = (otherSizeLimit / Constants.File.MB).toFixed(2);

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
