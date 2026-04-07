import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewsByProductIdController,
  likeDislikeHelpfulController,
  updateReviewController,
} from "../controllers";
import { middlewares } from "../../../middlewares";
import {
  createReviewZodSchema,
  updateLikeDislikeHelpfulSchema,
  updateReviewZodSchema,
} from "../validations";

export const reviewRouter = Router();

reviewRouter.post(
  "/:productId",
  middlewares.multer({
    type: "fields",
    fieldsConfig: [
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 5 },
    ],
  }),
  middlewares.request.empty({ body: true }),
  middlewares.auth.authenticated(false),
  middlewares.zod(createReviewZodSchema),
  middlewares.response.async.tryCatch(createReviewController),
);

reviewRouter.patch(
  "/:productId/:reviewId",
  middlewares.multer({
    type: "fields",
    fieldsConfig: [
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 5 },
    ],
  }),
  middlewares.request.empty({ filesOrBody: true }),
  middlewares.auth.authenticated(false),
  middlewares.toJSON(["removedImages", "removedVideos"]),
  middlewares.zod(updateReviewZodSchema),
  middlewares.response.async.tryCatch(updateReviewController),
);

reviewRouter.patch(
  "/:reviewId",
  middlewares.request.empty({ body: true, params: true }),
  middlewares.auth.authenticated(false),
  middlewares.zod(updateLikeDislikeHelpfulSchema),
  middlewares.response.async.tryCatch(likeDislikeHelpfulController),
);

reviewRouter.delete(
  "/:productId/:reviewId",
  middlewares.request.empty({ params: true }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(deleteReviewController),
);

reviewRouter.get(
  "/:productId",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatch(getReviewsByProductIdController),
);
