import { Router } from "express";

import {
  addProductToWishlistController,
  changePasswordController,
  updatePasswordController,
  createSellerRequestController,
  getUserController,
  getWishlistController,
  removeProductFromWishlistController,
  updateUserController,
  resetPasswordSendLinkController,
  resetPasswordController,
  validResetPasswordTokenController,
  forgotPasswordController,
  forgotPasswordSendLinkController,
  forgotPasswordResendLinkController,
  checkPasswordTokenValidityController,
} from "../controllers";
import { Middlewares } from "../../../Middlewares";
import {
  changePasswordZodSchema,
  sellerRequestZodSchema,
  updatePasswordZodSchema,
  updateUserZodSchema,
} from "../validations";
import { MB } from "../../../constants";

export const userRouter = Router();

// User Routes
userRouter.get("/user", Middlewares.Response.Async.TryCatch(getUserController));

userRouter.patch(
  "/user/update",
  Middlewares.Auth.Authenticated(false),
  Middlewares.Multer({ type: "single", fieldName: "profilePic" }),
  Middlewares.Request.Empty({ fileOrBody: true }),
  Middlewares.Zod(updateUserZodSchema),
  Middlewares.Response.Async.TryCatch(updateUserController),
);

userRouter.patch(
  "/user/update-password",
  Middlewares.Auth.Authenticated(true),
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Zod(updatePasswordZodSchema),
  Middlewares.Response.Async.TryCatch(updatePasswordController),
);

userRouter.patch(
  "/user/send-reset-password-link",
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(resetPasswordSendLinkController),
);

userRouter.patch(
  "/user/reset-password",
  Middlewares.Response.Async.TryCatch(resetPasswordController),
);

userRouter.get(
  "/user/reset-password-token-validity",
  Middlewares.Response.Async.TryCatch(validResetPasswordTokenController),
);

userRouter.post(
  "/user/forgot-password",
  Middlewares.Request.Empty({ query: true, body: true }),
  Middlewares.Response.Async.TryCatch(forgotPasswordController),
);

userRouter.get(
  "/user/forgot-password-token-validity",
  Middlewares.Response.Async.TryCatch(checkPasswordTokenValidityController),
);

userRouter.post(
  "/user/forgot-password-link",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Response.Async.TryCatch(forgotPasswordSendLinkController),
);

userRouter.post(
  "/user/forgot-password-resend-link",
  Middlewares.Response.Async.TryCatch(forgotPasswordResendLinkController),
);

userRouter.patch(
  "/user/change-password",
  Middlewares.Auth.Authenticated(true),
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Zod(changePasswordZodSchema),
  Middlewares.Response.Async.TryCatch(changePasswordController),
);

// Seller Routes
userRouter.post(
  "/seller/create",
  Middlewares.Auth.Authenticated(false),
  Middlewares.Multer({
    fieldName: "requiredDocuments",
    type: "fields",
    fieldsConfig: ["gst", "itr", "addressProof", "geoTagging"].map((name) => ({
      name,
      maxCount: 1,
    })),
    customLimits: { imageSize: 0.5 * MB },
  }),
  Middlewares.Request.Empty({ body: true, files: true }),
  Middlewares.JSONParser({
    fieldsToParse: ["businessAddress", "businessDetails"],
  }),
  Middlewares.Zod(sellerRequestZodSchema),
  Middlewares.Response.Async.TryCatch(createSellerRequestController),
);

// Wishlist Routes
userRouter.get(
  "/wishlist",
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(getWishlistController),
);

userRouter.post(
  "/wishlist/add/:productId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(addProductToWishlistController),
);

userRouter.delete(
  "/wishlist/remove/:productId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatchWithSession(
    removeProductFromWishlistController,
  ),
);
