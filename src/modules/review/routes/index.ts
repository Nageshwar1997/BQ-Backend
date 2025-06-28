import { Router } from "express";
import { createReviewController } from "../controllers";
import {
  AuthMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { createReviewZodSchema } from "../validations";

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
  AuthMiddleware.authenticated,
  ZodMiddleware.validateZodSchema(createReviewZodSchema),
  ResponseMiddleware.catchAsync(createReviewController)
);
