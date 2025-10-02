import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { AppError } from "../../../classes";
import { NODE_ENV } from "../../../envs";

const sendDevError = (err: AppError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: true,
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack,
  });
};

const sendProdError = (err: AppError, res: Response): void => {
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
  err: Error | AppError | MongooseError,
  _: Request,
  res: Response,
  __: NextFunction
): void => {
  let error: AppError;

  if (err instanceof MongooseError.ValidationError) {
    const entries = Object.entries(err.errors);

    let joinedMessage: string;

    if (entries.length === 1) {
      const [field, errorObj] = entries[0];
      joinedMessage = `${field}: ${errorObj.message}`;
    } else {
      joinedMessage = entries
        .map(
          ([field, errorObj], idx) =>
            `${idx + 1}. ${field}: ${errorObj.message}`
        )
        .join("\n");
    }
    error = new AppError(joinedMessage, 400, true);
  } else if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(
      NODE_ENV === "development"
        ? err.message ?? "Internal Server Error!"
        : "Internal Server Error!",
      500,
      false
    );
  }

  error.statusCode ||= 500;
  error.isOperational ??= false;

  if (NODE_ENV === "development") {
    return sendDevError(error, res);
  } else {
    return sendProdError(error, res);
  }
};
