import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../../classes";

export const validateZodSchema = (schema: ZodSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    console.log("result", result);
    if (!result.success) {
      // To make a zod error readable
      const errorMessage = result.error.errors
        .map((err) => err.message)
        .join(", ");
      return next(new AppError(errorMessage, 400));
    }
    req.body = result.data;
    next();
  };
};
