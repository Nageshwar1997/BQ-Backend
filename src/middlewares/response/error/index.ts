import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { AppError } from "../../../classes";
import { IS_DEV } from "../../../envs";

const commonErr = { success: false, error: true };

const sendDevError = (err: AppError, req: Request, res: Response) => {
  res.status(err.statusCode || 500).json({
    ...commonErr,
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack,
    requestId: req.requestId,
    myErr: err,
  });
};

const sendProdError = (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      ...commonErr,
      message: err.message,
      statusCode: err.statusCode || 500,
      requestId: req.requestId,
      myErr: err,
    });
  } else {
    res.status(500).json({
      ...commonErr,
      message: "Something went wrong!",
      statusCode: 500,
      requestId: req.requestId,
      myErr: err,
    });
  }
};

export const error = (
  err: Error | AppError | MongooseError,
  req: Request,
  res: Response,
  _: NextFunction
) => {
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
      IS_DEV === "true"
        ? err.message ?? "Internal Server Error!"
        : "Internal Server Error!",
      500,
      false
    );
  }

  error.statusCode ||= 500;
  error.isOperational ??= false;

  if (IS_DEV === "true") {
    return sendDevError(error, req, res);
  } else {
    return sendProdError(error, req, res);
  }
};
