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
import { middlewares } from "../../../middlewares";
import {
  changePasswordZodSchema,
  sellerRequestZodSchema,
  updatePasswordZodSchema,
  updateUserZodSchema,
} from "../validations";
import { constants } from "../../../constants";

export const userRouter = Router();

// User Routes
userRouter.get("/user", middlewares.response.async.tryCatch(getUserController));

userRouter.patch(
  "/user/update",
  middlewares.auth.authenticated(false),
  middlewares.multer({ type: "single", fieldName: "profilePic" }),
  middlewares.request.empty({ fileOrBody: true }),
  middlewares.zod(updateUserZodSchema),
  middlewares.response.async.tryCatch(updateUserController),
);

userRouter.patch(
  "/user/update-password",
  middlewares.auth.authenticated(true),
  middlewares.request.empty({ body: true }),
  middlewares.zod(updatePasswordZodSchema),
  middlewares.response.async.tryCatch(updatePasswordController),
);

userRouter.patch(
  "/user/send-reset-password-link",
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(resetPasswordSendLinkController),
);

userRouter.patch(
  "/user/reset-password",
  middlewares.response.async.tryCatch(resetPasswordController),
);

userRouter.get(
  "/user/reset-password-token-validity",
  middlewares.response.async.tryCatch(validResetPasswordTokenController),
);

userRouter.post(
  "/user/forgot-password",
  middlewares.request.empty({ query: true, body: true }),
  middlewares.response.async.tryCatch(forgotPasswordController),
);

userRouter.get(
  "/user/forgot-password-token-validity",
  middlewares.response.async.tryCatch(checkPasswordTokenValidityController),
);

userRouter.post(
  "/user/forgot-password-link",
  middlewares.request.empty({ body: true }),
  middlewares.response.async.tryCatch(forgotPasswordSendLinkController),
);

userRouter.post(
  "/user/forgot-password-resend-link",
  middlewares.response.async.tryCatch(forgotPasswordResendLinkController),
);

userRouter.patch(
  "/user/change-password",
  middlewares.auth.authenticated(true),
  middlewares.request.empty({ body: true }),
  middlewares.zod(changePasswordZodSchema),
  middlewares.response.async.tryCatch(changePasswordController),
);

// Seller Routes
userRouter.post(
  "/seller/create",
  middlewares.auth.authenticated(false),
  middlewares.multer({
    fieldName: "requiredDocuments",
    type: "fields",
    fieldsConfig: ["gst", "itr", "addressProof", "geoTagging"].map((name) => ({
      name,
      maxCount: 1,
    })),
    customLimits: { imageSize: 0.5 * constants.file.size.MB },
  }),
  middlewares.request.empty({ body: true, files: true }),
  middlewares.toJSON(["businessAddress", "businessDetails"]),
  middlewares.zod(sellerRequestZodSchema),
  middlewares.response.async.tryCatch(createSellerRequestController),
);

// Wishlist Routes
userRouter.get(
  "/wishlist",
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(getWishlistController),
);

userRouter.post(
  "/wishlist/add/:productId",
  middlewares.request.empty({ params: true }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(addProductToWishlistController),
);

userRouter.delete(
  "/wishlist/remove/:productId",
  middlewares.request.empty({ params: true }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatchWithSession(
    removeProductFromWishlistController,
  ),
);
