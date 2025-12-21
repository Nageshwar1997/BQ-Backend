import { NextFunction, Request, Response } from "express";
import {
  connectDB,
  // redisClient
} from "../../configs";

export const checkConnection = async (
  _: Request,
  __: Response,
  next: NextFunction
) => {
  try {
    await connectDB();
    // await redisClient.connect(); // FIXME - Create Separate Middleware for this

    next();
  } catch (error) {
    console.error("❌ Database connection middleware error:", error);
    // Forward the error to global error handler
    next(error);
  }
};
