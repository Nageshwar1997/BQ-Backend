import { TAppError } from "../types";

export class AppError extends Error {
  statusCode: TAppError["statusCode"];
  isOperational: TAppError["isOperational"];
  code: TAppError["code"];
  fieldErrors: TAppError["fieldErrors"];
  globalErrors: TAppError["globalErrors"];

  constructor({
    message,
    statusCode,
    code = "INTERNAL_ERROR",
    isOperational = true,
    fieldErrors = {},
    globalErrors = [],
  }: TAppError) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.fieldErrors = fieldErrors;
    this.globalErrors = globalErrors;

    Error.captureStackTrace(this, this.constructor);
  }
}
