import { Request } from "express";
import { Options } from "multer";
import { UserModule } from "../../modules";

// Connection config interface
export interface IMongoOptions {
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  maxPoolSize: number;
  minPoolSize?: number;
}

// Interface for authorized & authenticated requests with user
export interface AuthRequest extends Request {
  user?: Omit<UserModule.Types.UserProps, "password">; // User object without password
}

export type MulterType = "single" | "array" | "any" | "fields" | "none";

export type FieldsConfigType = {
  name: string;
  maxCount: number;
};

export type CustomLimitsType = {
  imageSize?: number;
  videoSize?: number;
  otherSize?: number;
};

export type CustomFileType = {
  imageTypes?: string[];
  videoTypes?: string[];
  otherTypes?: string[];
};

export interface CustomFileErrorProps {
  files: Express.Multer.File[];
  customLimits?: CustomLimitsType;
  customFileTypes?: CustomFileType;
}

export interface FileValidatorOptionsProps {
  type: MulterType;
  fieldName?: string;
  maxCount?: number;
  fieldsConfig?: FieldsConfigType[];
  limits?: Options["limits"];
  customLimits?: CustomLimitsType;
  customFileTypes?: CustomFileType;
}
