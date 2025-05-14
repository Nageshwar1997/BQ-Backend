import { NextFunction, Response } from "express";
import { AuthModule, UserModule } from "../../modules";
import { AuthorizedRequest } from "../../types";
import { isValidMongoId } from "../../utils";
import { Shared } from "../../shared";

export const authorization =
  (allowedRoles: UserModule.Types.UserRoleType[]) =>
  async (req: AuthorizedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = AuthModule.Services.getUserIdFromToken(req);

      const isValidId = isValidMongoId(userId);

      if (!isValidId) {
        throw new Shared.Classes.AppError("Invalid userId", 400);
      }

      const user = await UserModule.Services.getUserById(userId);

      if (!allowedRoles.includes(user.role)) {
        throw new Shared.Classes.AppError("Unauthorized", 401);
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
