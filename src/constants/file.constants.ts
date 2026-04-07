const size = {
  MB: 1024 ** 2, // 1MB
  IMAGE: 1024 ** 2 * 2, // 2MB
  VIDEO: 1024 ** 2 * 50, // 50MB
  OTHER: 1024 ** 2 * 2, // 2MB
};

const formats = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "image/svg+xml",
  ],
  VIDEO: ["video/mp4", "video/webm"],
};

export const fileConstants = { formats, size };
