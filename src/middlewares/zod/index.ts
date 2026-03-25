import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../../classes";

export const validateZodSchema =
  <T extends ZodObject<any>>(schema: T) =>
  (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."), // nested path support
        message: err.message,
      }));

      return next(new AppError("Validation Error", 400, true, errors));
    }

    req.body = result.data;
    next();
  };
