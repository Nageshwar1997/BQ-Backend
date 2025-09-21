import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../../classes";

export const validateZodSchema = (schema: ZodSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error?.errors;

      // To make a zod error readable
      const errorMessage = errors
        .map(
          (err, ind) =>
            `${errors.length > 1 ? `${ind + 1}) ` : ""}${err.message}`
        )
        .join(" ");
      return next(new AppError(errorMessage, 400));
    }
    req.body = { ...req.body, ...result.data };
    next();
  };
};
