import jwt from "jsonwebtoken";
import { Request } from "express";

import { AppError } from "../../../classes";
import { JWT_SECRET } from "../../../envs";
import { DecodedToken } from "../types";
import { getAuthorizationToken } from "../../../utils";

export const getUserIdFromToken = (req: Request) => {
  try {
    const token = req.get("Authorization");

    if (!token) {
      throw new AppError({ message: "You are not authenticated, please login", statusCode: 401, code: "AUTH_ERROR" });
    }

    const tokenWithoutBearer = getAuthorizationToken(token);

    const decoded = jwt.verify(
      tokenWithoutBearer,
      JWT_SECRET as string
    ) as DecodedToken;

    if (!decoded) {
      throw new AppError({ message: "Invalid token", statusCode: 401, code: "AUTH_ERROR" });
    } else if (!decoded.userId) {
      throw new AppError({ message: "UserId not found", statusCode: 404, code: "NOT_FOUND" });
    }

    return decoded.userId;
  } catch (error) {
    const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt;

    const errInstance =
      error instanceof
      (TokenExpiredError || JsonWebTokenError || NotBeforeError);

    if (errInstance) {
      const { name, message } = error;
      const comMsg = "Please login again.";
      let errorMessage = "";

      switch (name) {
        case "TokenExpiredError":
        case "JsonWebTokenError":
        case "NotBeforeError":
          errorMessage = `${message}, ${comMsg}`;
          break;
        default:
          errorMessage = `Token error: ${message}, ${comMsg}`;
          break;
      }
      throw new AppError({ message: errorMessage, statusCode: 401, code: "AUTH_ERROR" });
    }
    throw error;
  }
};
