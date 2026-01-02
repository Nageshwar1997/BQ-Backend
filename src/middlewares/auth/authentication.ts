import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { AuthModule, UserModule } from "../../modules";
import { isValidMongoId } from "../../utils";

export const authenticated =
  (needPassword?: boolean) =>
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    try {
      const userId = AuthModule.Services.getUserIdFromToken(req);

      isValidMongoId(userId, "Invalid userId", 400);

      const user = await UserModule.Services.getUserById(userId, needPassword);

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
