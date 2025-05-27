import { NextFunction, Request, Response } from "express";
import { Configs } from "../..";

export const checkConnection = async (
  _: Request,
  __: Response,
  next: NextFunction
) => {
  try {
    await Configs.Database.connect();

    next();
  } catch (error) {
    console.error("❌ Database connection middleware error:", error);
    // Forward the error to global error handler
    next(error);
  }
};
