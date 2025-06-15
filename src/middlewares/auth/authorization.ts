import { NextFunction, Response } from "express";
import { AuthModule, UserModule } from "../../modules";
import { AuthorizedRequest } from "../../types";
import { isValidMongoId } from "../../utils";
import { AppError } from "../../classes";

export const authorization =
  (allowedRoles: UserModule.Types.UserRoleType[]) =>
  async (req: AuthorizedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = AuthModule.Services.getUserIdFromToken(req);

      isValidMongoId(userId, "Invalid userId", 400);

      const user = await UserModule.Services.getUserById(userId);

      if (!allowedRoles.includes(user.role)) {
        throw new AppError("Unauthorized", 401);
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
