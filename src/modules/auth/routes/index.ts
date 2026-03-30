import { Router } from "express";

import { authControllers } from "../controllers";
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
  ResponseMiddleware.catchAsync(authControllers.register.sendOtp),
);

authRouter.post(
  "/register/resend-otp",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(zodSchemas.auth.register.email),
  ResponseMiddleware.catchAsync(authControllers.register.resendOtp),
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
  ResponseMiddleware.catchAsync(authControllers.register.verifyOtp),
);

// Login Route
authRouter.post(
  "/login",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(zodSchemas.auth.login),
  ResponseMiddleware.catchAsync(authControllers.login.manual),
);

// Logout
authRouter.delete(
  "/logout/:userId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsync(authControllers.logout),
);

// Google Auth
authRouter.get(
  "/google",
  ResponseMiddleware.catchAsync(authControllers.login.google.redirect),
);
authRouter.get(
  "/google/callback",
  ResponseMiddleware.catchAsync(authControllers.login.google.callback),
);

// LinkedIn Auth
authRouter.get(
  "/linkedin",
  ResponseMiddleware.catchAsync(authControllers.login.linkedin.redirect),
);
authRouter.get(
  "/linkedin/callback",
  ResponseMiddleware.catchAsync(authControllers.login.linkedin.callback),
);

// GitHub Auth
authRouter.get(
  "/github",
  ResponseMiddleware.catchAsync(authControllers.login.github.redirect),
);
authRouter.get(
  "/github/callback",
  ResponseMiddleware.catchAsync(authControllers.login.github.callback),
);

// Password Route
authRouter.post(
  "/forgot-password-send-link-and-otp",
  ResponseMiddleware.catchAsync(
    authControllers.password.forgotPassword.sendLinkAndOtp,
  ),
);

authRouter.post(
  "/forgot-password-resend-link-and-otp",
  ResponseMiddleware.catchAsync(
    authControllers.password.forgotPassword.resendLinkAndOtp,
  ),
);

authRouter.post(
  "/forgot-password-verify-otp",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ResponseMiddleware.catchAsync(
    authControllers.password.forgotPassword.verifyOtp,
  ),
);

authRouter.get(
  "/forgot-password-validate-token",
  ResponseMiddleware.catchAsync(
    authControllers.password.forgotPassword.validateToken,
  ),
);

authRouter.patch(
  "/forgot-password-set-password",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ResponseMiddleware.catchAsync(
    authControllers.password.forgotPassword.setPassword,
  ),
);
