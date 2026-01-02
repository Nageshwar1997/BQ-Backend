import { CLOUDINARY_MAIN_FOLDER } from "../../../../envs";

export const getSafeFileOriginalName = (originalname?: string) => {
  if (!originalname) return "file";

  // remove extension
  const nameWithoutExt = originalname.replace(/\.[^/.]+$/, "");

  // replace spaces with underscores
  const sanitized = nameWithoutExt.replace(/\s+/g, "_");

  // remove any non-alphanumeric or _ or - characters
  return sanitized.replace(/[^a-zA-Z0-9_-]/g, "") || "file";
};

export const getSafeFolderName = (folder?: string) => {
  const sanitize = (str: string) => str?.replace(/[&|\/\\#?%]/g, "_");
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";
  return sanitize(`${CLOUDINARY_MAIN_FOLDER}/${subFolder}`);
};

export const getSafePublicId = (name: string) => {
  const publicId = `${new Date()
    .toLocaleDateString()
    .replace(/\//g, "-")}_${Date.now()}_${getSafeFileOriginalName(name)}`;

  return publicId;
};

export const extractPublicId = (
  imageUrl: string,
  mediaType: "image" | "video"
): string => {
  const regex = (() => {
    switch (mediaType) {
      case "image":
        return /\/v\d+\/(.+?)\.(jpg|jpeg|png|webp|svg)(?:\?.*)?$/;
      case "video":
        return /\/v\d+\/(.+?)\.(mp4|webm|mov|mkv)(?:\?.*)?$/;
      default:
        return null;
    }
  })();

  if (!regex) return "";

  const match = imageUrl.match(regex);
  if (!match || !match[1]) return "";

  return match[1];
};
