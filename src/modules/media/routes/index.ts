import { Router } from "express";

import {
  getAllHomeVideosController,
  removeMultipleImagesController,
  removeSingleImageController,
  uploadHomeVideoController,
  uploadMultipleImagesController,
  uploadSingleImageController,
} from "../controllers";
import { Middlewares } from "../../../Middlewares";
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
  Middlewares.Multer({
    type: "single",
    fieldName: "image",
  }),
  Middlewares.Request.Empty({ file: true, fileOrBody: true }),
  Middlewares.Zod(uploadImageZodSchema),
  Middlewares.Response.Async.TryCatch(uploadSingleImageController),
);

// For Multiple Images Upload
mediaRouter.post(
  "/images/upload",
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Multer({
    type: "array",
    fieldName: "images",
    maxCount: 10,
  }),
  Middlewares.Request.Empty({ files: true, body: true }),
  Middlewares.Zod(uploadImageZodSchema),
  Middlewares.Response.Async.TryCatch(uploadMultipleImagesController),
);

// For Single Image Remove
mediaRouter.delete(
  "/image/delete",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Zod(removeSingleImageZodSchema),
  Middlewares.Response.Async.TryCatch(removeSingleImageController),
);

// For Multiple Images Remove
mediaRouter.delete(
  "/images/delete",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Auth.Authorization(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Zod(removeMultipleImagesZodSchema),
  Middlewares.Response.Async.TryCatch(removeMultipleImagesController),
);

// ========== Video Upload ==========
// For Home Carousel Video Upload
mediaRouter.post(
  "/video/upload",
  Middlewares.Auth.Authorization(["MASTER"]),
  Middlewares.Multer({
    type: "fields",
    fieldsConfig: ["video", "poster"].map((name) => ({ name, maxCount: 1 })),
  }),
  Middlewares.Zod(uploadHomeVideoZodSchema),
  Middlewares.Response.Async.TryCatch(uploadHomeVideoController),
);

// Home Carousel Video Routes
mediaRouter.get(
  "/videos/home",
  Middlewares.Response.Async.TryCatch(getAllHomeVideosController),
);
