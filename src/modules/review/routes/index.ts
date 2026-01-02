import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewsByProductIdController,
  likeDislikeHelpfulController,
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
import {
  createReviewZodSchema,
  updateLikeDislikeHelpfulSchema,
  updateReviewZodSchema,
} from "../validations";

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
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authenticated(false),
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
  AuthMiddleware.authenticated(false),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: ["removedImages", "removedVideos"],
  }),
  ZodMiddleware.validateZodSchema(updateReviewZodSchema),
  ResponseMiddleware.catchAsync(updateReviewController)
);

reviewRouter.patch(
  "/:reviewId",
  RequestMiddleware.checkEmptyRequest({ body: true, params: true }),
  AuthMiddleware.authenticated(false),
  ZodMiddleware.validateZodSchema(updateLikeDislikeHelpfulSchema),
  ResponseMiddleware.catchAsync(likeDislikeHelpfulController)
);

reviewRouter.delete(
  "/:productId/:reviewId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(deleteReviewController)
);

reviewRouter.get(
  "/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsync(getReviewsByProductIdController)
);
