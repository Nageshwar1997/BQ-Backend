import { NextFunction, Response } from "express";
import { Classes, Types, Utils } from "../..";
import { AuthModule, UserModule } from "../../../modules";

export const authenticate = async (
  req: Types.AuthRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const userId = AuthModule.Services.getUserIdFromToken(req);

    const isValidId = Utils.isValidMongoId(userId);

    if (!isValidId) {
      throw new Classes.AppError("Invalid userId", 400);
    }

    const user = await UserModule.Services.getUserById(userId);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
