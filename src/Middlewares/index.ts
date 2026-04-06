import { Auth } from "./Auth.Middleware";
import { Cors } from "./Cors.Middleware";
import { Database } from "./Database.Middleware";
import { JSONParser } from "./JSONParser.Middleware";
import { Logger } from "./Logger.Middleware";
import { Request } from "./Request.Middleware";
import { Response } from "./Response.Middleware";

export * as ZodMiddleware from "./zod";
export * as MulterMiddleware from "./Multer.Middleware";
export * as ResponseMiddleware from "./Response.Middleware";

export const Middlewares = {
  Auth,
  Cors,
  Database,
  Logger,
  JSONParser,
  Request,
  Response,
};
