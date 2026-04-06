import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../../classes";
import { segregateErrors } from "../../utils";

export const validateZodSchema =
  <T extends ZodObject<any>>(schema: T) =>
  (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."), // nested path support
        message: err.message,
      }));

      const { fieldErrors, globalErrors } = segregateErrors(errors);
      return next(
        new AppError({
          message: "Validation Error",
          statusCode: 400,
          code: "VALIDATION_ERROR",
          fieldErrors,
          globalErrors,
        }),
      );
    }

    req.body = result.data;
    next();
  };
