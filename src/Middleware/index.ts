import { Auth } from "./Auth.Middleware";
import { Cors } from "./Cors.Middleware";
import { Database } from "./Database.Middleware";

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
