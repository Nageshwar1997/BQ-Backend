import multer from "multer";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { FileValidatorOptionsProps, MulterType } from "../../types";
import { ErrorBuilder } from "../../classes";
import { getCustomError, getMulterError } from "./utils";

export const validateFiles = ({
  type,
  fieldName,
  maxCount,
  fieldsConfig,
  limits,
  customLimits,
  customFileTypes,
}: FileValidatorOptionsProps) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage, limits });

  let uploadMiddleware: RequestHandler;

  switch (type) {
    case "single":
      if (!fieldName)
        throw new Error("Field name is required for single upload.");
      uploadMiddleware = upload.single(fieldName);
      break;

    case "array":
      if (!fieldName)
        throw new Error("Field name is required for array upload.");
      uploadMiddleware = upload.array(fieldName, maxCount);
      break;

    case "fields":
      if (!fieldsConfig) throw new Error("fieldsConfig is required.");
      uploadMiddleware = upload.fields(fieldsConfig);
      break;

    case "any":
      uploadMiddleware = upload.any();
      break;

    case "none":
      uploadMiddleware = upload.none();
      break;

    default:
      throw new Error("Invalid upload type");
  }

  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err) => {
      const error = new ErrorBuilder();

      // Multer errors
      error.merge(
        getMulterError({
          err,
          fieldName,
          maxCount,
        }),
      );

      if (error.hasErrors()) {
        return next(
          error.throw({
            message: err?.message || "File validation failed",
            statusCode: 400,
            code: "UPLOAD_ERROR",
          }),
        );
      }

      // File validation
      const checkableTypes: MulterType[] = ["single", "array", "any", "fields"];

      if (checkableTypes.includes(type)) {
        let allFiles: Express.Multer.File[] = [];

        switch (type) {
          case "fields": {
            allFiles = Object.values(
              req.files || {},
            ).flat() as Express.Multer.File[];
            break;
          }

          case "array":
          case "any": {
            allFiles = (req.files as Express.Multer.File[]) || [];
            break;
          }

          case "single": {
            if (req.file) allFiles = [req.file];
            break;
          }
        }

        error.merge(
          getCustomError({
            files: allFiles,
            customLimits,
            customFileTypes,
          }),
        );

        if (error.hasErrors()) {
          return next(
            error.throw({
              message: "File validation failed",
              statusCode: 400,
              code: "UPLOAD_ERROR",
            }),
          );
        }
      }

      next();
    });
  };
};
