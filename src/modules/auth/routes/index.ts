import { Router } from "express";

import {
  githubCallback,
  githubLogin,
  googleCallback,
  googleLogin,
  linkedinCallback,
  linkedinLogin,
  loginController,
  registerResendOtpController,
  registerSendOtpController,
  registerVerifyOtpController,
} from "../controllers";
import { loginZodSchema, registerZodSchema } from "../validations";
import {
  ZodMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
  RequestMiddleware,
} from "../../../middlewares";

export const authRouter = Router();

// Register Route
authRouter.post(
  "/register/send-otp",
  RequestMiddleware.checkEmptyRequest({ query: true }),
  ResponseMiddleware.catchAsync(registerSendOtpController)
);

authRouter.post(
  "/register/resend-otp",
  RequestMiddleware.checkEmptyRequest({ query: true }),
  ResponseMiddleware.catchAsync(registerResendOtpController)
);

authRouter.post(
  "/register/verify-otp",
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  RequestMiddleware.checkEmptyRequest({
    filesOrBody: true,
    body: true,
    query: true,
  }),
  ZodMiddleware.validateZodSchema(registerZodSchema),
  ResponseMiddleware.catchAsync(registerVerifyOtpController)
);

// Login Route
authRouter.post(
  "/login",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(loginZodSchema),
  ResponseMiddleware.catchAsync(loginController)
);

// Google Auth
authRouter.get("/google", ResponseMiddleware.catchAsync(googleLogin));
authRouter.get(
  "/google/callback",
  ResponseMiddleware.catchAsync(googleCallback)
);

// LinkedIn Auth
authRouter.get("/linkedin", ResponseMiddleware.catchAsync(linkedinLogin));
authRouter.get(
  "/linkedin/callback",
  ResponseMiddleware.catchAsync(linkedinCallback)
);

// GitHub Auth
authRouter.get("/github", ResponseMiddleware.catchAsync(githubLogin));
authRouter.get(
  "/github/callback",
  ResponseMiddleware.catchAsync(githubCallback)
);
