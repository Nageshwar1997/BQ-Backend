import { Request, Response } from "express";
import { AppError } from "../../../classes";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      throw new AppError("Message is required", 400);
    }

    res.success(200, "Chat fetched successfully", {});
  } catch (err) {
    console.error(err);
    throw err;
  }
};
