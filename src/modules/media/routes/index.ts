import { Router } from "express";

import {
  getAllHomeVideosController,
  removeMultipleImagesController,
  removeSingleImageController,
  uploadHomeVideoController,
  uploadMultipleImagesController,
  uploadSingleImageController,
} from "../controllers";
import {
  AuthMiddleware,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import {
  removeMultipleImagesZodSchema,
  removeSingleImageZodSchema,
  uploadHomeVideoZodSchema,
  uploadImageZodSchema,
} from "../validations";

export const mediaRouter = Router();

// ========== Image Upload ==========
// For Single Image Upload
mediaRouter.post(
  "/image/upload",
  AuthMiddleware.authorization(["MASTER", "ADMIN", "SELLER"]),
  MulterMiddleware.validateFiles({
    type: "single",
    fieldName: "image",
  }),
  RequestMiddleware.checkEmptyRequest({ file: true, fileOrBody: true }),
  ZodMiddleware.validateZodSchema(uploadImageZodSchema),
  ResponseMiddleware.catchAsync(uploadSingleImageController)
);

// For Multiple Images Upload
mediaRouter.post(
  "/images/upload",
  AuthMiddleware.authorization(["MASTER", "ADMIN", "SELLER"]),
  MulterMiddleware.validateFiles({
    type: "array",
    fieldName: "images",
    maxCount: 10,
  }),
  RequestMiddleware.checkEmptyRequest({ files: true, body: true }),
  ZodMiddleware.validateZodSchema(uploadImageZodSchema),
  ResponseMiddleware.catchAsync(uploadMultipleImagesController)
);

// For Single Image Remove
mediaRouter.delete(
  "/image/delete",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authorization(["MASTER", "ADMIN", "SELLER"]),
  ZodMiddleware.validateZodSchema(removeSingleImageZodSchema),
  ResponseMiddleware.catchAsync(removeSingleImageController)
);

// For Multiple Images Remove
mediaRouter.delete(
  "/images/delete",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authorization(["MASTER", "ADMIN", "SELLER"]),
  ZodMiddleware.validateZodSchema(removeMultipleImagesZodSchema),
  ResponseMiddleware.catchAsync(removeMultipleImagesController)
);

// ========== Video Upload ==========
// For Home Carousel Video Upload
mediaRouter.post(
  "/video/upload",
  AuthMiddleware.authorization(["MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: ["video", "poster"].map((name) => ({ name, maxCount: 1 })),
  }),
  ZodMiddleware.validateZodSchema(uploadHomeVideoZodSchema),
  ResponseMiddleware.catchAsync(uploadHomeVideoController)
);

// Home Carousel Video Routes
mediaRouter.get(
  "/videos/home",
  ResponseMiddleware.catchAsync(getAllHomeVideosController)
);
