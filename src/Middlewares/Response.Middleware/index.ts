import { AsyncHandler } from "./TryCatch";
import { ErrorHandler } from "./Error";
import { NotFound } from "./NotFound";
import { Success } from "./Success";

export const Response = {
  Async: AsyncHandler,
  Error: ErrorHandler,
  NotFound,
  Success,
};
