import { Router } from "express";
import upload from "../configs/upload.multer.config";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller";
import { validateSchema } from "../utils";
import {
  registerUserValidationSchema,
  loginUserValidationSchema,
} from "../validations/user.validation";

const authRouter = Router();

authRouter.post(
  "/register",
  upload.single("profilePic"),
  validateSchema(registerUserValidationSchema),
  registerController
);
authRouter.post(
  "/login",
  validateSchema(loginUserValidationSchema),
  loginController
);

export default authRouter;
