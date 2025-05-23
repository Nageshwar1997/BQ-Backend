import { NextFunction, Response } from "express";
import { AppError } from "../constructors";
import { getUserIdFromToken } from "../services/user.service";
import { CatchErrorResponse, isValidMongoId } from "../utils";
import { User } from "../models";
import { AuthenticatedRequest } from "../types";

const isAuthenticated = async (
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserIdFromToken(req, next);
    if (!userId) {
      throw new AppError("UserId not found", 404);
    }

    const isValidId = isValidMongoId(userId as string);
    if (!isValidId) {
      throw new AppError("Invalid userId", 400);
    }

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      throw new AppError("User not found", 404);
    }

    req.user = user;

    next();
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export default isAuthenticated;
