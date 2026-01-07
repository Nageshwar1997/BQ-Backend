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
  AuthMiddleware,
  JSONParseMiddleware,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
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
  AuthMiddleware.authenticated(false),
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  RequestMiddleware.checkEmptyRequest({ fileOrBody: true }),
  ZodMiddleware.validateZodSchema(updateUserZodSchema),
  ResponseMiddleware.catchAsync(updateUserController)
);

userRouter.patch(
  "/user/update-password",
  AuthMiddleware.authenticated(true),
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(updatePasswordZodSchema),
  ResponseMiddleware.catchAsync(updatePasswordController)
);

userRouter.patch(
  "/user/send-reset-password-link",
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(resetPasswordSendLinkController)
);

userRouter.patch(
  "/user/reset-password",
  ResponseMiddleware.catchAsync(resetPasswordController)
);

userRouter.get(
  "/user/reset-password-token-validity",
  ResponseMiddleware.catchAsync(validResetPasswordTokenController)
);

userRouter.post(
  "/user/forgot-password",
  RequestMiddleware.checkEmptyRequest({ query: true, body: true }),
  ResponseMiddleware.catchAsync(forgotPasswordController)
);

userRouter.get(
  "/user/forgot-password-token-validity",
  ResponseMiddleware.catchAsync(checkPasswordTokenValidityController)
);

userRouter.post(
  "/user/forgot-password-link",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ResponseMiddleware.catchAsync(forgotPasswordSendLinkController)
);

userRouter.post(
  "/user/forgot-password-resend-link",
  ResponseMiddleware.catchAsync(forgotPasswordResendLinkController)
);

userRouter.patch(
  "/user/change-password",
  AuthMiddleware.authenticated(true),
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(changePasswordZodSchema),
  ResponseMiddleware.catchAsync(changePasswordController)
);

// Seller Routes
userRouter.post(
  "/seller/create",
  AuthMiddleware.authenticated(false),
  MulterMiddleware.validateFiles({
    fieldName: "requiredDocuments",
    type: "fields",
    fieldsConfig: ["gst", "itr", "addressProof", "geoTagging"].map((name) => ({
      name,
      maxCount: 1,
    })),
    customLimits: { imageSize: 0.5 * MB },
  }),
  RequestMiddleware.checkEmptyRequest({ body: true, files: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: ["businessAddress", "businessDetails"],
  }),
  ZodMiddleware.validateZodSchema(sellerRequestZodSchema),
  ResponseMiddleware.catchAsync(createSellerRequestController)
);

// Wishlist Routes
userRouter.get(
  "/wishlist",
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(getWishlistController)
);

userRouter.post(
  "/wishlist/add/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(addProductToWishlistController)
);

userRouter.delete(
  "/wishlist/remove/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(
    removeProductFromWishlistController
  )
);
