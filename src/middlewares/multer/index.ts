import multer from "multer";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { FileValidatorOptionsProps, MulterType } from "../../types";
import { AppError } from "../../classes";
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
      if (!fieldsConfig)
        throw new Error("fieldsConfig is required for fields upload.");
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
      const multerErrors = getMulterError({
        err,
        fieldName,
        maxCount,
      });

      if (multerErrors.globalErrors.length || multerErrors.fieldErrors) {
        return next(
          new AppError({
            ...multerErrors,
            message: err.message || "File validation failed",
            statusCode: 400,
            code: "UPLOAD_ERROR",
          }),
        );
      }

      const checkableTypes: MulterType[] = ["single", "array", "any", "fields"];
      const shouldCheckFiles = checkableTypes.includes(type);

      if (shouldCheckFiles) {
        let allFiles: Express.Multer.File[] = [];

        switch (type) {
          case "fields": {
            const fieldMap = req.files as {
              [field: string]: Express.Multer.File[];
            };
            allFiles = Object.values(fieldMap || {}).flat();
            break;
          }

          case "array":
          case "any": {
            allFiles = (req.files as Express.Multer.File[]) || [];
            break;
          }

          case "single": {
            if (req.file) {
              allFiles = [req.file];
            }
            break;
          }

          default:
            allFiles = [];
        }

        const customErrors = getCustomError({
          files: allFiles,
          customLimits,
          customFileTypes,
        });

        if (customErrors.globalErrors.length || customErrors.fieldErrors) {
          return next(
            new AppError({
              ...customErrors,
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
