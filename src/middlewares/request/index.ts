import { NextFunction, Request, Response } from "express";
import { AppError } from "../../classes";

type CheckOptions = {
  body?: boolean;
  files?: boolean;
  params?: boolean;
  query?: boolean;
};

export const checkEmptyRequest =
  (options: CheckOptions) =>
  (req: Request, _: Response, next: NextFunction) => {
    try {
      if (options.body && (!req.body || Object.keys(req.body).length === 0)) {
        throw new AppError("Please provide some data in the body!", 400);
      }

      if (
        options.files &&
        (!req.files || Object.keys(req.files).length === 0)
      ) {
        throw new AppError("Please provide some files!", 400);
      }

      if (
        options.params &&
        (!req.params || Object.keys(req.params).length === 0)
      ) {
        throw new AppError("Please provide some params!", 400);
      }

      if (
        options.query &&
        (!req.query || Object.keys(req.query).length === 0)
      ) {
        throw new AppError("Please provide some query!", 400);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
