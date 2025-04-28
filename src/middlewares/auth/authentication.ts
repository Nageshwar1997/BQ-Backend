import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { AuthModule, UserModule } from "../../modules";
import { isValidMongoId } from "../../utils";
import { AppError } from "../../classes";

export const authenticated = async (
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const userId = AuthModule.Providers.getUserIdFromToken(req);

    const isValidId = isValidMongoId(userId);

    if (!isValidId) {
      throw new AppError("Invalid userId", 400);
    }

    const user = await UserModule.Services.getUserById(userId);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
