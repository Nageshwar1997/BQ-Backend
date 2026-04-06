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
import {
  Middlewares,
  MulterMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../Middlewares";
import {
  changePasswordZodSchema,
  sellerRequestZodSchema,
  updatePasswordZodSchema,
  updateUserZodSchema,
} from "../validations";
import { MB } from "../../../constants";

export const userRouter = Router();

// User Routes
userRouter.get("/user", ResponseMiddleware.catchAsync(getUserController));

userRouter.patch(
  "/user/update",
  Middlewares.Auth.Authenticated(false),
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  Middlewares.Request.Empty({ fileOrBody: true }),
  ZodMiddleware.validateZodSchema(updateUserZodSchema),
  ResponseMiddleware.catchAsync(updateUserController),
);

userRouter.patch(
  "/user/update-password",
  Middlewares.Auth.Authenticated(true),
  Middlewares.Request.Empty({ body: true }),
  ZodMiddleware.validateZodSchema(updatePasswordZodSchema),
  ResponseMiddleware.catchAsync(updatePasswordController),
);

userRouter.patch(
  "/user/send-reset-password-link",
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(resetPasswordSendLinkController),
);

userRouter.patch(
  "/user/reset-password",
  ResponseMiddleware.catchAsync(resetPasswordController),
);

userRouter.get(
  "/user/reset-password-token-validity",
  ResponseMiddleware.catchAsync(validResetPasswordTokenController),
);

userRouter.post(
  "/user/forgot-password",
  Middlewares.Request.Empty({ query: true, body: true }),
  ResponseMiddleware.catchAsync(forgotPasswordController),
);

userRouter.get(
  "/user/forgot-password-token-validity",
  ResponseMiddleware.catchAsync(checkPasswordTokenValidityController),
);

userRouter.post(
  "/user/forgot-password-link",
  Middlewares.Request.Empty({ body: true }),
  ResponseMiddleware.catchAsync(forgotPasswordSendLinkController),
);

userRouter.post(
  "/user/forgot-password-resend-link",
  ResponseMiddleware.catchAsync(forgotPasswordResendLinkController),
);

userRouter.patch(
  "/user/change-password",
  Middlewares.Auth.Authenticated(true),
  Middlewares.Request.Empty({ body: true }),
  ZodMiddleware.validateZodSchema(changePasswordZodSchema),
  ResponseMiddleware.catchAsync(changePasswordController),
);

// Seller Routes
userRouter.post(
  "/seller/create",
  Middlewares.Auth.Authenticated(false),
  MulterMiddleware.validateFiles({
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
  ZodMiddleware.validateZodSchema(sellerRequestZodSchema),
  ResponseMiddleware.catchAsync(createSellerRequestController),
);

// Wishlist Routes
userRouter.get(
  "/wishlist",
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(getWishlistController),
);

userRouter.post(
  "/wishlist/add/:productId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(addProductToWishlistController),
);

userRouter.delete(
  "/wishlist/remove/:productId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(
    removeProductFromWishlistController,
  ),
);
