export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
