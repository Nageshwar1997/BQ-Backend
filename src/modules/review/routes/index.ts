import { Router } from "express";
import { createReviewController } from "../controllers";
import {
  AuthMiddleware,
  JSONParseMiddleware,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { createReviewZodSchema, updateReviewZodSchema } from "../validations";
import { updateReviewController } from "../controllers/updateReview";

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
