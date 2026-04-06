import { Auth } from "./Auth.Middleware";
import { Cors } from "./Cors.Middleware";
import { Database } from "./Database.Middleware";
import { JSONParser } from "./JSONParser.Middleware";
import { Logger } from "./Logger.Middleware";
import { ValidateFiles } from "./Multer.Middleware";
import { Request } from "./Request.Middleware";
import { Response } from "./Response.Middleware";
import { ValidateZodSchema } from "./Zod.Middleware";

export const Middlewares = {
  Auth,
  Cors,
  Database,
  Logger,
  JSONParser,
  Request,
  Response,
  Zod: ValidateZodSchema,
  Multer: ValidateFiles,
};
