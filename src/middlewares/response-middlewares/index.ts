import { tryCatchResponseMiddleware } from "./tryCatch.response.middleware";
import { errorResponse } from "./error.response.middleware";
import { notFoundResponse } from "./notFound.response.middleware";
import { successResponse } from "./success.response.middleware";

export const responseMiddleware = {
  async: tryCatchResponseMiddleware,
  error: errorResponse,
  notFound: notFoundResponse,
  success: successResponse,
};
