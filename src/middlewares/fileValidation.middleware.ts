import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import upload from "../configs/upload.multer.config";
import { AppError } from "../constructors";
import { CatchErrorResponse } from "../utils";

export const validateImageFiles =
  (fields: { name: string; maxCount: number }[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadMiddleware =
        fields.length === 1
          ? upload.single(fields[0].name)
          : upload.fields(fields);

      uploadMiddleware(req, res, (err) => {
        if (err instanceof MulterError) {
          const fieldConfig = fields?.find(
            (field) => field?.name === err?.field
          );
          const maxCount = fieldConfig?.maxCount;

          return next(
            new AppError(
              `Too many files uploaded${
                maxCount
                  ? `. Please upload maximum ${maxCount} file${
                      maxCount > 1 ? "s" : ""
                    }`
                  : ""
              } for "${err?.field}"`,
              400
            )
          );
        } else if (err) {
          return next(
            new AppError(
              `An unknown error occurred while uploading ${err?.field}.`,
              400
            )
          );
        }
        next();
      });
    } catch (error) {
      return CatchErrorResponse(error, next);
    }
  };
