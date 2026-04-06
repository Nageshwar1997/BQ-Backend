import { NextFunction, Response } from "express";
import { AuthenticatedRequest, AuthorizedRequest, TRole } from "../../types";
import { UserModule } from "../../Modules";
import { isValidMongoId } from "../../utils";
import { AppError } from "../../Classes";
import { AuthModule } from "../../Modules/Auth.Module";

const Authenticated =
  (needPassword?: boolean) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = AuthModule.Services.GetUserIdFromToken(req);

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

const Authorization =
  (allowedRoles: TRole[], needPassword?: boolean) =>
  async (req: AuthorizedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = AuthModule.Services.GetUserIdFromToken(req);

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

export const Auth = { Authenticated, Authorization };
