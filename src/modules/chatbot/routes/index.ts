import { Router } from "express";
import { chatController } from "../controllers/chat";

export const chatRouter = Router();

chatRouter.post("/chat", chatController);
