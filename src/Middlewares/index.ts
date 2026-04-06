import { Auth } from "./Auth.Middleware";
import { Cors } from "./Cors.Middleware";
import { Database } from "./Database.Middleware";
import { JSONParser } from "./JSONParser.Middleware";
import { Logger } from "./Logger.Middleware";

export * as ZodMiddleware from "./zod";
export * as MulterMiddleware from "./multer";
export * as ResponseMiddleware from "./response";
export * as RequestMiddleware from "./request";

export const Middlewares = {
  Auth,
  Cors,
  Database,
  Logger,
  JSONParser,
};
