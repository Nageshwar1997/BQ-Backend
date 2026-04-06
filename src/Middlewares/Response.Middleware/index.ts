import { AsyncHandler } from "./Response.TryCatch";
import { ErrorHandler } from "./Response.Error";
import { NotFound } from "./Response.NotFound";
import { Success } from "./Response.Success";

export const Response = {
  Async: AsyncHandler,
  Error: ErrorHandler,
  NotFound,
  Success,
};
