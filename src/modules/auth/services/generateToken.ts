import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

import { Common } from "../../..";

export const generateToken = (userId: ObjectId | string): string => {
  if (!Common.Envs.JWT_SECRET) {
    throw new Common.Classes.AppError("JWT secret not defined", 500);
  }

  try {
    const token = jwt.sign({ userId }, Common.Envs.JWT_SECRET, {
      expiresIn: "1d",
    });

    if (!token) {
      throw new Common.Classes.AppError("Failed to generate token", 500);
    }

    return token;
  } catch (error) {
    throw error;
  }
};
