import { AsyncHandler } from "./TryCatch";
import { ErrorHandler } from "./Error";

export * from "./notFound";
export * from "./success";

export const Response = {
  Async: AsyncHandler,
  Error: ErrorHandler,
};
