import { Router } from "express";

import {
  addProductToWishlistController,
  createSellerRequestController,
  getUserController,
  getWishlistController,
  removeProductFromWishlistController,
} from "../controllers";
import {
  AuthMiddleware,
  JSONParseMiddleware,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { sellerRequestZodSchema } from "../validations";
import { MB } from "../../../constants";

export const userRouter = Router();

userRouter.get("/user", ResponseMiddleware.catchAsync(getUserController));

// Seller Routes
userRouter.post(
  "/seller/create",
  AuthMiddleware.authenticated,
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
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getWishlistController)
);

userRouter.post(
  "/wishlist/add/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(addProductToWishlistController)
);

userRouter.delete(
  "/wishlist/remove/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsyncWithTransaction(
    removeProductFromWishlistController
  )
);
