import jwt from "jsonwebtoken";
import { Request } from "express";

import { Common } from "../../..";
import { Types } from "..";

export const getUserIdFromToken = (req: Request) => {
  try {
    const token = req.get("Authorization");

    if (!token) {
      throw new Common.Classes.AppError("Token not found, please login", 401);
    }

    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    const decoded = jwt.verify(
      tokenWithoutBearer,
      Common.Envs.JWT_SECRET as string
    ) as Types.DecodedToken;

    if (!decoded) {
      throw new Common.Classes.AppError("Invalid token", 401);
    } else if (!decoded.userId) {
      throw new Common.Classes.AppError("UserId not found", 404);
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
      throw new Common.Classes.AppError(errorMessage, 401);
    }
    throw error;
  }
};
