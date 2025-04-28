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
  ResponseMiddleware,
} from "../../../middlewares";

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
  ResponseMiddleware.catchAsync(uploadMultipleImagesController)
);

// For Single Image Remove
mediaRouter.delete(
  "/image/delete",
  AuthMiddleware.authorization(["MASTER", "ADMIN", "SELLER"]),
  ResponseMiddleware.catchAsync(removeSingleImageController)
);

// For Multiple Images Remove
mediaRouter.delete(
  "/images/delete",
  AuthMiddleware.authorization(["MASTER", "ADMIN", "SELLER"]),
  ResponseMiddleware.catchAsync(removeMultipleImagesController)
);

// ========== Video Upload ==========
// For Home Carousel Video Upload
mediaRouter.post(
  "/video/upload",
  AuthMiddleware.authorization(["MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: [
      { name: "video", maxCount: 1 },
      { name: "poster", maxCount: 1 },
    ],
  }),
  ResponseMiddleware.catchAsync(uploadHomeVideoController)
);

// Home Carousel Video Routes
mediaRouter.get(
  "/videos/home",
  ResponseMiddleware.catchAsync(getAllHomeVideosController)
);
