import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../../classes";

export const validateZodSchema = (schema: ZodSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    let filePayload: Record<
      string,
      Express.Multer.File | Express.Multer.File[]
    > = {};

    if (Array.isArray(req.files)) {
      // Group files by fieldname
      filePayload = req.files.reduce((acc, file) => {
        if (!acc[file.fieldname]) {
          acc[file.fieldname] = [];
        }
        (acc[file.fieldname] as Express.Multer.File[]).push(file);
        return acc;
      }, {} as Record<string, Express.Multer.File[]>);
    } else {
      // Multer's field-based object format
      filePayload = Object.fromEntries(
        Object.entries(req.files || {}).map(([key, value]) => [key, value])
      );
    }

    const payload = {
      ...req.body,
      ...(req.file && { file: req.file }),
      ...filePayload,
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
      return next(new AppError(errorMessage, 400));
    }
    req.body = { ...req.body, ...result.data };
    next();
  };
};
