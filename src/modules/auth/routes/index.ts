import { Router } from "express";

import { loginController, registerController } from "../controllers";
import { loginJoiSchema, registerJoiSchema } from "../validations";
import {
  JoiMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
} from "../../../middlewares";

export const authRouter = Router();

// Register Route
authRouter.post(
  "/register",
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  JoiMiddleware.validateJoiSchema(registerJoiSchema),
  ResponseMiddleware.catchAsync(registerController)
);

// Login Route
authRouter.post(
  "/login",
  JoiMiddleware.validateJoiSchema(loginJoiSchema),
  ResponseMiddleware.catchAsync(loginController)
);
