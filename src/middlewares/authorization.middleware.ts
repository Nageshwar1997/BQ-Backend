import { NextFunction, Response } from "express";
import { AppError } from "../constructors";
import { getUserIdFromToken } from "../services/user.service";
import { CatchErrorResponse, isValidMongoId } from "../utils";
import { User } from "../models";
import { AuthorizedRequest } from "../types";

const isAuthorized =
  (allowedRoles: string[]) =>
  async (req: AuthorizedRequest, _: Response, next: NextFunction) => {
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

      if (!allowedRoles.includes(user.role)) {
        throw new AppError("Unauthorized", 401);
      }

      req.user = user;

      next();
    } catch (error) {
      return CatchErrorResponse(error, next);
    }
  };

export default isAuthorized;
