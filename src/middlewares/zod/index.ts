import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { Shared } from "../../shared";

export const validateZodSchema = (schema: ZodSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.body) {
      return next(
        new Shared.Classes.AppError(
          "Request body is missing. Please provide required data.",
          400
        )
      );
    }

    const payload = {
      ...req.body,
      ...(req.file && { file: req.file }),
      ...Object.fromEntries(
        Object.entries(req.files || {}).map(([key, value]) => [key, value[0]])
      ),
    };

    const result = schema.safeParse(payload);

    if (!result.success) {
      const errors = result.error?.errors;
      // To make a zod error readable
      const errorMessage = errors
        .map(
          (err, ind) =>
            `${errors.length > 1 ? `${ind + 1}) ` : ""}${err.message}`
        )
        .join(" ");
      return next(new Shared.Classes.AppError(errorMessage, 400));
    }
    req.body = result.data;
    next();
  };
};
