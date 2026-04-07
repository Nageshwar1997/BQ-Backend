import { authMiddleware } from "./auth.middleware";
import { checkOrigin } from "./cors.middleware";
import { checkDbConnection } from "./database.middleware";
import { parseToJsonMiddleware } from "./toJson.middleware";
import { loggerMiddleware } from "./logger.middleware";
import { multerMiddleware } from "./multer.middleware";
import { requestMiddlewares } from "./request.middleware";
import { responseMiddleware } from "./response-middlewares";
import { zodMiddleware } from "./zod.middleware";

export const middlewares = {
  auth: authMiddleware,
  cors: checkOrigin,
  database: checkDbConnection,
  logger: loggerMiddleware,
  toJSON: parseToJsonMiddleware,
  request: requestMiddlewares,
  response: responseMiddleware,
  zod: zodMiddleware,
  multer: multerMiddleware,
};
