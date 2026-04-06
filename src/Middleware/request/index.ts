import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { AppError } from "../../classes";

type CheckOptions = {
  body?: boolean;
  file?: boolean;
  fileOrBody?: boolean;
  filesOrBody?: boolean;
  files?: boolean;
  params?: boolean;
  query?: boolean;
};

export const checkEmptyRequest =
  (options: CheckOptions) =>
  (req: Request, _: Response, next: NextFunction) => {
    try {
      const { body, file, files, fileOrBody, filesOrBody, params, query } =
        options;

      // Define emptiness checks for each part of the request
      const isBodyEmpty = !req.body || Object.keys(req.body).length === 0;
      const isFileEmpty =
        !req.file ||
        (typeof req.file === "object" && Object.keys(req.file).length === 0);
      const isFilesEmpty =
        !req.files ||
        (typeof req.files === "object" && Object.keys(req.files).length === 0);
      const isParamsEmpty = !req.params || Object.keys(req.params).length === 0;
      const isQueryEmpty = !req.query || Object.keys(req.query).length === 0;

      // Case 1: If both body and files are required, and both are empty
      if (filesOrBody && !file && isBodyEmpty && isFilesEmpty) {
        throw new AppError({
          message: "Please provide some data in the body or files!",
          statusCode: 400,
        });
      }

      // Case 2: If both body and file are required, and both are empty
      if (fileOrBody && !files && isBodyEmpty && isFileEmpty) {
        throw new AppError({
          message: "Please provide some data in the body or file!",
          statusCode: 400,
        });
      }

      // Case 3: If only body is required and is empty
      if (!files && !file && body && isBodyEmpty) {
        throw new AppError({ message: "Please provide some data in the body!", statusCode: 400 });
      }

      // Case 4: If only files are required and are empty
      if (files && !file && !body && isFilesEmpty) {
        throw new AppError({ message: "Please provide some files!", statusCode: 400 });
      }

      // Case 5: If only single file is required and is empty
      if (file && !files && !body && isFileEmpty) {
        throw new AppError({ message: "Please provide some files!", statusCode: 400 });
      }

      // Case 6: If params are required and are empty
      if (params && isParamsEmpty) {
        throw new AppError({ message: "Please provide some params!", statusCode: 400 });
      }

      // Case 7: If query is required and is empty
      if (query && isQueryEmpty) {
        throw new AppError({ message: "Please provide some query!", statusCode: 400 });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = randomUUID();
  req.requestId = id; // ← must be on req
  res.setHeader("X-Request-Id", id);
  next();
};
