import { NextFunction, Request, Response } from "express";
import { AppError } from "../constructors";
import { User } from "../models";
import { getUserIdFromToken } from "../services/user.service";
import { isValidMongoId, SuccessResponse, CatchErrorResponse } from "../utils";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserIdFromToken(req, next);

    const isValidId = isValidMongoId(userId as string);

    if (!isValidId) {
      throw new AppError("Invalid userId", 400);
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    SuccessResponse(res, 200, "User fetched successfully", { user });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};
