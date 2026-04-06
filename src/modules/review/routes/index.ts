import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewsByProductIdController,
  likeDislikeHelpfulController,
  updateReviewController,
} from "../controllers";
import { Middlewares } from "../../../Middlewares";
import {
  createReviewZodSchema,
  updateLikeDislikeHelpfulSchema,
  updateReviewZodSchema,
} from "../validations";

export const reviewRouter = Router();

reviewRouter.post(
  "/:productId",
  Middlewares.Multer({
    type: "fields",
    fieldsConfig: [
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 5 },
    ],
  }),
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Zod(createReviewZodSchema),
  Middlewares.Response.Async.TryCatch(createReviewController),
);

reviewRouter.patch(
  "/:productId/:reviewId",
  Middlewares.Multer({
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
  Middlewares.Zod(updateReviewZodSchema),
  Middlewares.Response.Async.TryCatch(updateReviewController),
);

reviewRouter.patch(
  "/:reviewId",
  Middlewares.Request.Empty({ body: true, params: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Zod(updateLikeDislikeHelpfulSchema),
  Middlewares.Response.Async.TryCatch(likeDislikeHelpfulController),
);

reviewRouter.delete(
  "/:productId/:reviewId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(deleteReviewController),
);

reviewRouter.get(
  "/:productId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Response.Async.TryCatch(getReviewsByProductIdController),
);
