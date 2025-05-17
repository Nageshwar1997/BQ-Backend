import { Router } from "express";

import { loginController, registerController } from "../controllers";
import { loginZodSchema, registerZodSchema } from "../validations";
import {
  ZodMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
} from "../../../middlewares";

export const authRouter = Router();

// Register Route
authRouter.post(
  "/register",
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  ZodMiddleware.validateZodSchema(registerZodSchema),
  ResponseMiddleware.catchAsync(registerController)
);

// Login Route
authRouter.post(
  "/login",
  ZodMiddleware.validateZodSchema(loginZodSchema),
  ResponseMiddleware.catchAsync(loginController)
);
