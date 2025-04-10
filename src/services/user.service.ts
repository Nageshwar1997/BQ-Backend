import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../constructors";
import { NextFunction, Request } from "express";
import { CatchErrorResponse } from "../utils";
// Define an interface for the token payload
interface DecodedToken extends JwtPayload {
  userId: string; // Assuming userId is a string
}
export const getUserIdFromToken = (req: Request, next: NextFunction) => {
  try {
    const token = req.get("Authorization");
    if (!token) {
      throw new AppError("Token not found", 401);
    }

    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    const decoded = jwt.verify(
      tokenWithoutBearer,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    if (!decoded || !decoded.userId) {
      throw new AppError("Invalid token", 401);
    }
    return decoded?.userId;
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};
