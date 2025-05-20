import { Request } from "express";

// Interface for authenticated requests with user
export interface AuthenticatedRequest extends Request {
  user?: Omit<UserModule.Types.UserProps, "password">; // User object without password
}

// Interface for authorized requests with user
export interface AuthorizedRequest extends Request {
  user?: Omit<UserModule.Types.UserProps, "password">; // User object without password
}

import multer from "multer";
import { UserModule } from "../modules";

export type MulterType = "single" | "array" | "any" | "fields" | "none";

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

export type FieldsConfigType = {
  name: string;
  maxCount: number;
};

export interface FileValidatorOptionsProps {
  type: MulterType;
  fieldName?: string;
  maxCount?: number;
  fieldsConfig?: FieldsConfigType[];
  limits?: multer.Options["limits"];
  customLimits?: CustomLimitsType;
  customFileTypes?: CustomFileType;
}

export interface CustomFileErrorProps {
  files: Express.Multer.File[];
  customLimits?: CustomLimitsType;
  customFileTypes?: CustomFileType;
}

export interface ZodStringProps {
  field: string;
  parentField?: string;
  min?: number | undefined;
  max?: number | undefined;
  blockMultipleSpaces?: boolean;
  blockSingleSpace?: boolean;
  nonEmpty?: boolean;
}

export type ValidateZodFieldProps = ZodStringProps;
