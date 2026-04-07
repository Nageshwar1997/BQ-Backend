import { NextFunction, Response } from "express";
import { AuthenticatedRequest, AuthorizedRequest, TRole } from "../types";
import { UserModule } from "../Modules";
import { isValidMongoId } from "../utils";
import { AppError } from "../classes";
import { authModule } from "../modules/auth";

const authenticated =
  (needPassword?: boolean) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = authModule.services.GetUserIdFromToken(req);

      isValidMongoId(userId, "Invalid userId", 400);

      const user = await UserModule.Services.getUserById({
        id: userId,
        lean: true,
        password: needPassword,
      });

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };

const authorized =
  (allowedRoles: TRole[], needPassword?: boolean) =>
  async (req: AuthorizedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = authModule.services.GetUserIdFromToken(req);

      isValidMongoId(userId, "Invalid userId", 400);

      const user = await UserModule.Services.getUserById({
        id: userId,
        lean: true,
        password: needPassword,
      });

      if (!allowedRoles.includes(user.role)) {
        throw new AppError({
          message: "Unauthorized",
          statusCode: 401,
          code: "AUTH_ERROR",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };

export const authMiddleware = { authenticated, authorized };
