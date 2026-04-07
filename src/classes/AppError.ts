import { IAppError } from "../types";

export class AppError extends Error {
  statusCode: IAppError["statusCode"];
  isOperational: IAppError["isOperational"];
  code: IAppError["code"];
  fieldErrors: IAppError["fieldErrors"];
  globalErrors: IAppError["globalErrors"];

  constructor({
    message,
    statusCode,
    code = "INTERNAL_ERROR",
    isOperational = true,
    fieldErrors = {},
    globalErrors = [],
  }: IAppError) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.fieldErrors = fieldErrors;
    this.globalErrors = globalErrors;

    Error.captureStackTrace(this, this.constructor);
  }
}
