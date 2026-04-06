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
  Middlewares,
  MulterMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../Middlewares";
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
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  MulterMiddleware.validateFiles({
    type: "single",
    fieldName: "image",
  }),
  Middlewares.Request.Empty({ file: true, fileOrBody: true }),
  ZodMiddleware.validateZodSchema(uploadImageZodSchema),
  ResponseMiddleware.catchAsync(uploadSingleImageController),
);

// For Multiple Images Upload
mediaRouter.post(
  "/images/upload",
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  MulterMiddleware.validateFiles({
    type: "array",
    fieldName: "images",
    maxCount: 10,
  }),
  Middlewares.Request.Empty({ files: true, body: true }),
  ZodMiddleware.validateZodSchema(uploadImageZodSchema),
  ResponseMiddleware.catchAsync(uploadMultipleImagesController),
);

// For Single Image Remove
mediaRouter.delete(
  "/image/delete",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  ZodMiddleware.validateZodSchema(removeSingleImageZodSchema),
  ResponseMiddleware.catchAsync(removeSingleImageController),
);

// For Multiple Images Remove
mediaRouter.delete(
  "/images/delete",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  ZodMiddleware.validateZodSchema(removeMultipleImagesZodSchema),
  ResponseMiddleware.catchAsync(removeMultipleImagesController),
);

// ========== Video Upload ==========
// For Home Carousel Video Upload
mediaRouter.post(
  "/video/upload",
  Middlewares.Auth.Authorization(["MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: ["video", "poster"].map((name) => ({ name, maxCount: 1 })),
  }),
  ZodMiddleware.validateZodSchema(uploadHomeVideoZodSchema),
  ResponseMiddleware.catchAsync(uploadHomeVideoController),
);

// Home Carousel Video Routes
mediaRouter.get(
  "/videos/home",
  ResponseMiddleware.catchAsync(getAllHomeVideosController),
);
