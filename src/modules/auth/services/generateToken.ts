import jwt from "jsonwebtoken";

import { Types } from "mongoose";
import { Classes, Envs } from "../../../common";

export const generateToken = (userId: string | Types.ObjectId): string => {
  if (!Envs.JWT_SECRET) {
    throw new Classes.AppError("JWT secret not defined", 500);
  }

  try {
    const token = jwt.sign({ userId }, Envs.JWT_SECRET, {
      expiresIn: "1d",
    });

    if (!token) {
      throw new Classes.AppError("Failed to generate token", 500);
    }

    return token;
  } catch (error) {
    throw error;
  }
};
