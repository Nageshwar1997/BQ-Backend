const MB = 1024 ** 2;
const MAX_IMAGE_FILE_SIZE = 2 * MB; // 2MB
const MAX_VIDEO_FILE_SIZE = 50 * MB; // 50MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/svg+xml",
];

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const FileConstants = {
  MB,
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
};
