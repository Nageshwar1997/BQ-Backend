import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { Shared } from "../../..";
import { NODE_ENV } from "../../../envs";

const sendDevError = (err: Shared.Classes.AppError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: true,
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack,
  });
};

const sendProdError = (err: Shared.Classes.AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: true,
      message: err.message,
      statusCode: err.statusCode || 500,
    });
  } else {
    res.status(500).json({
      success: false,
      error: true,
      message: "Something went wrong!",
      statusCode: 500,
    });
  }
};

export const error = (
  err: Error | Shared.Classes.AppError | MongooseError,
  _: Request,
  res: Response,
  __: NextFunction
): void => {
  const error =
    err instanceof Shared.Classes.AppError
      ? err
      : new Shared.Classes.AppError(
          NODE_ENV === "development"
            ? err.message ?? "Internal Server Error!"
            : "Internal Server Error!",
          500,
          false
        );

  error.statusCode ||= 500;
  error.isOperational ??= false;

  if (NODE_ENV === "development") {
    return sendDevError(error, res);
  } else {
    return sendProdError(error, res);
  }
};
