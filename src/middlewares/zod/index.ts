import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../../classes";

export const validateZodSchema = (schema: ZodSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.body) {
      return next(
        new AppError(
          "Request body is missing. Please provide required data.",
          400
        )
      );
    }
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // To make a zod error readable
      const errorMessage = result.error.errors
        .map((err, ind) => `${ind + 1}) ${err.message}`)
        .join(" ");
      return next(new AppError(errorMessage, 400));
    }
    req.body = result.data;
    next();
  };
};
