import { Router } from "express";

import { authControllers } from "./controllers";
import { middlewares } from "../../middlewares";
import { zodSchemas } from "../../validations";

export const authRouter = Router();

// Register Route
authRouter.post(
  "/register/send-otp",
  middlewares.request.empty({ body: true }),
  middlewares.zod(zodSchemas.auth.register.email),
  middlewares.response.async.tryCatch(authControllers.register.sendOtp),
);

authRouter.post(
  "/register/resend-otp",
  middlewares.request.empty({ body: true }),
  middlewares.zod(zodSchemas.auth.register.email),
  middlewares.response.async.tryCatch(authControllers.register.resendOtp),
);

authRouter.post(
  "/register/verify-otp",
  middlewares.multer({ type: "single", fieldName: "profilePic" }),
  middlewares.request.empty({
    file: false,
    body: true,
    query: true,
  }),
  middlewares.zod(zodSchemas.auth.register.verify),
  middlewares.response.async.tryCatch(authControllers.register.verifyOtp),
);

// Login Route
authRouter.post(
  "/login",
  middlewares.request.empty({ body: true }),
  middlewares.zod(zodSchemas.auth.login),
  middlewares.response.async.tryCatch(authControllers.login.manual),
);

// Logout
authRouter.delete(
  "/logout/:userId",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatch(authControllers.logout),
);

// Google Auth
authRouter.get(
  "/google",
  middlewares.response.async.tryCatch(authControllers.login.google.redirect),
);
authRouter.get(
  "/google/callback",
  middlewares.response.async.tryCatch(authControllers.login.google.callback),
);

// LinkedIn Auth
authRouter.get(
  "/linkedin",
  middlewares.response.async.tryCatch(authControllers.login.linkedin.redirect),
);
authRouter.get(
  "/linkedin/callback",
  middlewares.response.async.tryCatch(authControllers.login.linkedin.callback),
);

// GitHub Auth
authRouter.get(
  "/github",
  middlewares.response.async.tryCatch(authControllers.login.github.redirect),
);
authRouter.get(
  "/github/callback",
  middlewares.response.async.tryCatch(authControllers.login.github.callback),
);

// Password Route
authRouter.post(
  "/forgot-password-send-link-and-otp",
  middlewares.response.async.tryCatch(
    authControllers.password.forgotPassword.sendLinkAndOtp,
  ),
);

authRouter.post(
  "/forgot-password-resend-link-and-otp",
  middlewares.response.async.tryCatch(
    authControllers.password.forgotPassword.resendLinkAndOtp,
  ),
);

authRouter.post(
  "/forgot-password-verify-otp",
  middlewares.request.empty({ body: true }),
  middlewares.response.async.tryCatch(
    authControllers.password.forgotPassword.verifyOtp,
  ),
);

authRouter.get(
  "/forgot-password-validate-token",
  middlewares.response.async.tryCatch(
    authControllers.password.forgotPassword.validateToken,
  ),
);

authRouter.patch(
  "/forgot-password-set-password",
  middlewares.request.empty({ body: true }),
  middlewares.response.async.tryCatch(
    authControllers.password.forgotPassword.setPassword,
  ),
);
