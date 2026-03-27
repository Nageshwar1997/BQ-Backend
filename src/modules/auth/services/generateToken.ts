import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { AppError } from "../../../classes";
import { JWT_SECRET } from "../../../envs";

export const generateToken = (userId: Types.ObjectId | string): string => {
  if (!JWT_SECRET) {
    throw new AppError({ message: "JWT secret not defined", statusCode: 500, code: "INTERNAL_ERROR" });
  }

  try {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });

    if (!token) {
      throw new AppError({ message: "Failed to generate token", statusCode: 500, code: "INTERNAL_ERROR" });
    }

    return token;
  } catch (error) {
    throw error;
  }
};
