import { Router } from "express";

import {
  getAllHomeVideosController,
  removeMultipleImagesController,
  removeSingleImageController,
  uploadHomeVideoController,
  uploadMultipleImagesController,
  uploadSingleImageController,
} from "../controllers";
import { middlewares } from "../../../middlewares";
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
  middlewares.auth.authorized(["MASTER", "ADMIN", "SELLER"]),
  middlewares.multer({
    type: "single",
    fieldName: "image",
  }),
  middlewares.request.empty({ file: true, fileOrBody: true }),
  middlewares.zod(uploadImageZodSchema),
  middlewares.response.async.tryCatch(uploadSingleImageController),
);

// For Multiple Images Upload
mediaRouter.post(
  "/images/upload",
  middlewares.auth.authorized(["MASTER", "ADMIN", "SELLER"]),
  middlewares.multer({
    type: "array",
    fieldName: "images",
    maxCount: 10,
  }),
  middlewares.request.empty({ files: true, body: true }),
  middlewares.zod(uploadImageZodSchema),
  middlewares.response.async.tryCatch(uploadMultipleImagesController),
);

// For Single Image Remove
mediaRouter.delete(
  "/image/delete",
  middlewares.request.empty({ body: true }),
  middlewares.auth.authorized(["MASTER", "ADMIN", "SELLER"]),
  middlewares.zod(removeSingleImageZodSchema),
  middlewares.response.async.tryCatch(removeSingleImageController),
);

// For Multiple Images Remove
mediaRouter.delete(
  "/images/delete",
  middlewares.request.empty({ body: true }),
  middlewares.auth.authorized(["MASTER", "ADMIN", "SELLER"]),
  middlewares.zod(removeMultipleImagesZodSchema),
  middlewares.response.async.tryCatch(removeMultipleImagesController),
);

// ========== Video Upload ==========
// For Home Carousel Video Upload
mediaRouter.post(
  "/video/upload",
  middlewares.auth.authorized(["MASTER"]),
  middlewares.multer({
    type: "fields",
    fieldsConfig: ["video", "poster"].map((name) => ({ name, maxCount: 1 })),
  }),
  middlewares.zod(uploadHomeVideoZodSchema),
  middlewares.response.async.tryCatch(uploadHomeVideoController),
);

// Home Carousel Video Routes
mediaRouter.get(
  "/videos/home",
  middlewares.response.async.tryCatch(getAllHomeVideosController),
);
