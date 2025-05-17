import { NextFunction, Response } from "express";
import { Classes, Types, Utils } from "../..";
import { Modules } from "../../..";

export const authorize =
  (allowedRoles: Modules.User.Types.UserRoleType[]) =>
  async (req: Types.AuthRequest, _: Response, next: NextFunction) => {
    try {
      const userId = Modules.Auth.Services.getUserIdFromToken(req);

      const isValidId = Utils.isValidMongoId(userId);

      if (!isValidId) {
        throw new Classes.AppError("Invalid userId", 400);
      }

      const user = await Modules.User.Services.getUserById(userId);

      if (!allowedRoles.includes(user.role)) {
        throw new Classes.AppError("Unauthorized", 401);
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
