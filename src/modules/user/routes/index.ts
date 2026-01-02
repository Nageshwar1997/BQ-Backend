import { Router } from "express";

import {
  addProductToWishlistController,
  changePasswordController,
  createPasswordController,
  createSellerRequestController,
  getUserController,
  getWishlistController,
  removeProductFromWishlistController,
  updateUserController,
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
  createPasswordZodSchema,
  sellerRequestZodSchema,
  updateUserZodSchema,
} from "../validations";
import { MB } from "../../../constants";

export const userRouter = Router();

// User Routes
userRouter.get("/user", ResponseMiddleware.catchAsync(getUserController));

userRouter.patch(
  "/user/create-password",
  AuthMiddleware.authenticated(true),
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(createPasswordZodSchema),
  ResponseMiddleware.catchAsync(createPasswordController)
);

userRouter.patch(
  "/user/update",
  AuthMiddleware.authenticated(false),
  MulterMiddleware.validateFiles({ type: "single", fieldName: "profilePic" }),
  RequestMiddleware.checkEmptyRequest({ filesOrBody: true }),
  ZodMiddleware.validateZodSchema(updateUserZodSchema),
  ResponseMiddleware.catchAsync(updateUserController)
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
