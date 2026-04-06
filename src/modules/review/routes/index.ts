import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewsByProductIdController,
  likeDislikeHelpfulController,
  updateReviewController,
} from "../controllers";
import {
  Middlewares,
  MulterMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../Middlewares";
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
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Auth.Authenticated(false),
  ZodMiddleware.validateZodSchema(createReviewZodSchema),
  ResponseMiddleware.catchAsync(createReviewController),
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
  Middlewares.Request.Empty({ filesOrBody: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.JSONParser({
    fieldsToParse: ["removedImages", "removedVideos"],
  }),
  ZodMiddleware.validateZodSchema(updateReviewZodSchema),
  ResponseMiddleware.catchAsync(updateReviewController),
);

reviewRouter.patch(
  "/:reviewId",
  Middlewares.Request.Empty({ body: true, params: true }),
  Middlewares.Auth.Authenticated(false),
  ZodMiddleware.validateZodSchema(updateLikeDislikeHelpfulSchema),
  ResponseMiddleware.catchAsync(likeDislikeHelpfulController),
);

reviewRouter.delete(
  "/:productId/:reviewId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(deleteReviewController),
);

reviewRouter.get(
  "/:productId",
  Middlewares.Request.Empty({ params: true }),
  ResponseMiddleware.catchAsync(getReviewsByProductIdController),
);
