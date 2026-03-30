import { Router } from "express";

import {
  AuthControllers,
  forgotPasswordResendLinkAndOtpController,
  forgotPasswordSendLinkAndOtpController,
  forgotPasswordVerifyOtpController,
  registerResendOtpController,
  registerSendOtpController,
  registerVerifyOtpController,
  setForgotPasswordController,
  validateTokenForForgotPasswordController,
} from "../controllers";
import {
  ZodMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
  RequestMiddleware,
} from "../../../middlewares";
import { zodSchemas } from "../../../validations";

export const authRouter = Router();

// Register Route
authRouter.post(
  "/register/send-otp",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(zodSchemas.auth.register.email),
  ResponseMiddleware.catchAsync(registerSendOtpController),
);

authRouter.post(
  "/register/resend-otp",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(zodSchemas.auth.register.email),
  ResponseMiddleware.catchAsync(registerResendOtpController),
);

authRouter.post(
  "/register/verify-otp",
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  RequestMiddleware.checkEmptyRequest({
    file: false,
    body: true,
    query: true,
  }),
  ZodMiddleware.validateZodSchema(zodSchemas.auth.register.verify),
  ResponseMiddleware.catchAsync(registerVerifyOtpController),
);

// Login Route
authRouter.post(
  "/login",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(zodSchemas.auth.login),
  ResponseMiddleware.catchAsync(AuthControllers.login.manual),
);

// Logout
authRouter.delete(
  "/logout/:userId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsync(AuthControllers.logout),
);

// Google Auth
authRouter.get(
  "/google",
  ResponseMiddleware.catchAsync(AuthControllers.login.google.redirect),
);
authRouter.get(
  "/google/callback",
  ResponseMiddleware.catchAsync(AuthControllers.login.google.callback),
);

// LinkedIn Auth
authRouter.get(
  "/linkedin",
  ResponseMiddleware.catchAsync(AuthControllers.login.linkedin.redirect),
);
authRouter.get(
  "/linkedin/callback",
  ResponseMiddleware.catchAsync(AuthControllers.login.linkedin.callback),
);

// GitHub Auth
authRouter.get(
  "/github",
  ResponseMiddleware.catchAsync(AuthControllers.login.github.redirect),
);
authRouter.get(
  "/github/callback",
  ResponseMiddleware.catchAsync(AuthControllers.login.github.callback),
);

// Password Route
authRouter.post(
  "/send-forgot-password-link-and-otp",
  ResponseMiddleware.catchAsync(forgotPasswordSendLinkAndOtpController),
);

authRouter.post(
  "/resend-forgot-password-link-and-otp",
  ResponseMiddleware.catchAsync(forgotPasswordResendLinkAndOtpController),
);

authRouter.post(
  "/verify-forgot-password-otp",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ResponseMiddleware.catchAsync(forgotPasswordVerifyOtpController),
);

authRouter.get(
  "/validate-forgot-password-token",
  ResponseMiddleware.catchAsync(validateTokenForForgotPasswordController),
);

authRouter.patch(
  "/set-forgot-password",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ResponseMiddleware.catchAsync(setForgotPasswordController),
);
