import { Router } from "express";

import { authControllers } from "../controllers";
import { Middlewares } from "../../../Middlewares";
import { zodSchemas } from "../../../validations";

export const authRouter = Router();

// Register Route
authRouter.post(
  "/register/send-otp",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Zod(zodSchemas.auth.register.email),
  Middlewares.Response.Async.TryCatch(authControllers.register.sendOtp),
);

authRouter.post(
  "/register/resend-otp",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Zod(zodSchemas.auth.register.email),
  Middlewares.Response.Async.TryCatch(authControllers.register.resendOtp),
);

authRouter.post(
  "/register/verify-otp",
  Middlewares.Multer({ type: "single", fieldName: "profilePic" }),
  Middlewares.Request.Empty({
    file: false,
    body: true,
    query: true,
  }),
  Middlewares.Zod(zodSchemas.auth.register.verify),
  Middlewares.Response.Async.TryCatch(authControllers.register.verifyOtp),
);

// Login Route
authRouter.post(
  "/login",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Zod(zodSchemas.auth.login),
  Middlewares.Response.Async.TryCatch(authControllers.login.manual),
);

// Logout
authRouter.delete(
  "/logout/:userId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Response.Async.TryCatch(authControllers.logout),
);

// Google Auth
authRouter.get(
  "/google",
  Middlewares.Response.Async.TryCatch(authControllers.login.google.redirect),
);
authRouter.get(
  "/google/callback",
  Middlewares.Response.Async.TryCatch(authControllers.login.google.callback),
);

// LinkedIn Auth
authRouter.get(
  "/linkedin",
  Middlewares.Response.Async.TryCatch(authControllers.login.linkedin.redirect),
);
authRouter.get(
  "/linkedin/callback",
  Middlewares.Response.Async.TryCatch(authControllers.login.linkedin.callback),
);

// GitHub Auth
authRouter.get(
  "/github",
  Middlewares.Response.Async.TryCatch(authControllers.login.github.redirect),
);
authRouter.get(
  "/github/callback",
  Middlewares.Response.Async.TryCatch(authControllers.login.github.callback),
);

// Password Route
authRouter.post(
  "/forgot-password-send-link-and-otp",
  Middlewares.Response.Async.TryCatch(
    authControllers.password.forgotPassword.sendLinkAndOtp,
  ),
);

authRouter.post(
  "/forgot-password-resend-link-and-otp",
  Middlewares.Response.Async.TryCatch(
    authControllers.password.forgotPassword.resendLinkAndOtp,
  ),
);

authRouter.post(
  "/forgot-password-verify-otp",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Response.Async.TryCatch(
    authControllers.password.forgotPassword.verifyOtp,
  ),
);

authRouter.get(
  "/forgot-password-validate-token",
  Middlewares.Response.Async.TryCatch(
    authControllers.password.forgotPassword.validateToken,
  ),
);

authRouter.patch(
  "/forgot-password-set-password",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Response.Async.TryCatch(
    authControllers.password.forgotPassword.setPassword,
  ),
);
