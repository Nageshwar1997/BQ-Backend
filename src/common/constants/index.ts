import { Envs, Types } from "..";

// Default connection options
export const MONGO_OPTIONS: Types.IMongoOptions = {
  serverSelectionTimeoutMS: 5000, // 5 seconds connection timeout
  socketTimeoutMS: 45000, // 45 seconds query timeout
  maxPoolSize: 10, // Max connections in pool
  minPoolSize: 2, // Min connections to maintain
};

export const MB = 1024 ** 2;

export const MAX_IMAGE_FILE_SIZE = 2 * MB; // 2MB
export const MAX_VIDEO_FILE_SIZE = 50 * MB; // 50MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const allowedOrigins = [
  Envs.FRONTEND_LOCAL_HOST_CLIENT_URL,
  Envs.FRONTEND_LOCAL_HOST_ADMIN_URL,
  Envs.FRONTEND_LOCAL_HOST_MASTER_URL,
  Envs.FRONTEND_LOCAL_HOST_PUBLIC_URL_1,
  Envs.FRONTEND_LOCAL_HOST_PUBLIC_URL_2,
  Envs.FRONTEND_PRODUCTION_CLIENT_URL,
  Envs.FRONTEND_PRODUCTION_ADMIN_URL,
  Envs.FRONTEND_PRODUCTION_MASTER_URL,
];

export const singleSpaceRegex = /^(?!.*\s{2,}).*$/;
