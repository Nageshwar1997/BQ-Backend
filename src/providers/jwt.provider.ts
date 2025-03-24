import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import { Types } from "mongoose";
import { AppError } from "constructors/index";
import { CatchErrorResponse } from "utils/index";

const generateToken = async (userId: Types.ObjectId, next: NextFunction) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    if (!token) {
      throw new AppError("Failed to generate token", 500);
    }

    return token;
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export default generateToken;
