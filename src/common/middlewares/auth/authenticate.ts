import { NextFunction, Response } from "express";
import { Classes, Types, Utils } from "../..";
import { Modules } from "../../..";

export const authenticate = async (
  req: Types.AuthRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const userId = Modules.Auth.Services.getUserIdFromToken(req);

    const isValidId = Utils.isValidMongoId(userId);

    if (!isValidId) {
      throw new Classes.AppError("Invalid userId", 400);
    }

    const user = await Modules.User.Services.getUserById(userId);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
