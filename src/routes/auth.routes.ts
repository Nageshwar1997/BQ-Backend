import { Router } from "express";
import {
  loginController,
  registerController,
} from "../../src/controllers/auth.controller";
import upload from "../../src/configs/upload.multer.config";
import {
  loginUserValidationSchema,
  registerUserValidationSchema,
} from "../../src/validations/user.validation";
import { validateSchema } from "../../src/utils";

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
