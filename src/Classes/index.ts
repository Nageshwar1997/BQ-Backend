import { AppError } from "./AppError";
import { AppSuccess } from "./AppSuccess";
import { ErrorBuilder } from "./ErrorBuilder";
import { Mail } from "./Mail";
import { Redis } from "./Redis";

export * from "./AppError";

export const classes = {
  AppError,
  AppSuccess,
  ErrorBuilder,
  Mail,
  Redis,
};
