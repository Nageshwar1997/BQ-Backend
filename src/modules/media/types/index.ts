import { Types } from "mongoose";

export type CloudinaryConfigOption = "image" | "video" | "product";

export interface SingleFileUploaderProps {
  file: Express.Multer.File;
  folder?: string;
  cloudinaryConfigOption: CloudinaryConfigOption;
}

export interface MultipleFileUploaderProps {
  files: Express.Multer.File[];
  folder?: string;
  cloudinaryConfigOption: CloudinaryConfigOption;
}

export interface HomeVideoProps {
  title: string;
  m3u8Url: string;
  originalUrl: string;
  posterUrl: string;
  public_id: string;
  duration: number;
  user: Types.ObjectId;
}
