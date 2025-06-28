import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  updateReviewController,
} from "../controllers";
import {
  AuthMiddleware,
  JSONParseMiddleware,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { createReviewZodSchema, updateReviewZodSchema } from "../validations";

export const reviewRouter = Router();

reviewRouter.post(
  "/:productId",
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: [
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 5 },
    ],
  }),
  RequestMiddleware.checkEmptyRequest({ body: true, files: false }),
  AuthMiddleware.authenticated,
  ZodMiddleware.validateZodSchema(createReviewZodSchema),
  ResponseMiddleware.catchAsync(createReviewController)
);

reviewRouter.patch(
  "/:productId/:reviewId",
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: [
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 5 },
    ],
  }),
  RequestMiddleware.checkEmptyRequest({ filesOrBody: true }),
  AuthMiddleware.authenticated,
  JSONParseMiddleware.JSONParse({
    fieldsToParse: ["removedImages", "removedVideos"],
  }),
  ZodMiddleware.validateZodSchema(updateReviewZodSchema),
  ResponseMiddleware.catchAsync(updateReviewController)
);

reviewRouter.delete(
  "/:productId/:reviewId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(deleteReviewController)
);
