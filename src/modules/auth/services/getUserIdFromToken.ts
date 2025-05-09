import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

import { AppError } from "../../../classes";
import { JWT_SECRET } from "../../../envs";
import { DecodedToken } from "../types";

export const getUserIdFromToken = (req: Request) => {
  try {
    const token = req.get("Authorization");

    if (!token) {
      throw new AppError("Token not found, please login", 401);
    }

    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    const decoded = jwt.verify(
      tokenWithoutBearer,
      JWT_SECRET as string
    ) as DecodedToken;

    if (!decoded) {
      throw new AppError("Invalid token", 401);
    } else if (!decoded.userId) {
      throw new AppError("UserId not found", 404);
    }

    return decoded.userId;
  } catch (error) {
    throw error;
  }
};
