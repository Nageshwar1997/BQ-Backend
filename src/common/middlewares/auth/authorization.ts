import { NextFunction, Response } from "express";
import { Auth, User } from "../../../modules";
import { Classes, Types, Utils } from "../..";

export const authorization =
  (allowedRoles: User.Types.UserRoleType[]) =>
  async (req: Types.AuthRequest, _: Response, next: NextFunction) => {
    try {
      const userId = Auth.Services.getUserIdFromToken(req);

      const isValidId = Utils.isValidMongoId(userId);

      if (!isValidId) {
        throw new Classes.AppError("Invalid userId", 400);
      }

      const user = await User.Services.getUserById(userId);

      if (!allowedRoles.includes(user.role)) {
        throw new Classes.AppError("Unauthorized", 401);
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
