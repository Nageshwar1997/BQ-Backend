import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { AppError } from "../../../classes";
import { IS_DEV_MODE } from "../../../envs";
import { mapToFieldErrors } from "../../../utils";

const baseResponse = { success: false, error: true };

export const errorHandler = (
  err: Error | AppError | MongooseError,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  let error: AppError;

  if (err instanceof MongooseError.ValidationError) {
    const rawErrors = Object.entries(err.errors).map(([field, errorObj]) => ({
      field,
      message: errorObj.message,
    }));

    const { fieldErrors, globalErrors } = mapToFieldErrors(rawErrors);

    error = new AppError({
      message: "Validation Error",
      statusCode: 400,
      code: "VALIDATION_ERROR",
      fieldErrors,
      globalErrors,
    });
  } else if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError({
      message: IS_DEV_MODE
        ? err.message || "Internal Server Error"
        : "Something went wrong!",
      statusCode: 500,
      code: "INTERNAL_ERROR",
      isOperational: false,
    });
  }

  const response = {
    ...baseResponse,
    message: error.message,
    code: error.code,
    fieldErrors: error.fieldErrors,
    globalErrors: error.globalErrors,
    statusCode: error.statusCode,
    requestId: req.requestId,
    ...(IS_DEV_MODE && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};
