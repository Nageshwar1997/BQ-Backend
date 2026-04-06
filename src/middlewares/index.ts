import { Auth } from "./auth";
import { Cors } from "./cors";
import { Database } from "./database";

export * as ZodMiddleware from "./zod";
export * as MulterMiddleware from "./multer";
export * as ResponseMiddleware from "./response";
export * as JSONParseMiddleware from "./JSONParse";
export * as RequestMiddleware from "./request";
export * as LoggerMiddleware from "./logger";

export const Middlewares = {
  Auth,
  Cors,
  Database,
};
