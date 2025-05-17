import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { Classes } from "../../../shared";
import { JWT_SECRET } from "../../../envs";

export const generateToken = (userId: Types.ObjectId | string): string => {
  if (!JWT_SECRET) {
    throw new Classes.AppError("JWT secret not defined", 500);
  }

  try {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });

    if (!token) {
      throw new Classes.AppError("Failed to generate token", 500);
    }

    return token;
  } catch (error) {
    throw error;
  }
};
