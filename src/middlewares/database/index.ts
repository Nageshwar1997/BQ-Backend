import { NextFunction, Request, Response } from "express";
import { connection } from "mongoose";
import { AppError } from "../../classes";

export const checkDbConnection = async (
  _: Request,
  __: Response,
  next: NextFunction
) => {
  try {
    if (connection.readyState === 1) {
      console.log("✅ DB connection is ready");
    } else {
      console.warn("⚠️ Database not ready, readyState:", connection.readyState);
      throw new AppError("Database not ready", 500);
    }

    next();
  } catch (error) {
    console.error("❌ Database connection middleware error:", error);
    // Forward the error to global error handler
    next(error);
  }
};
