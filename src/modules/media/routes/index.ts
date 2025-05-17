import { Router } from "express";
import { Middlewares } from "../../../common";
import { Controllers } from "..";

export const router = Router();

// ========== Image Upload ==========
// For Single Image Upload
router.post(
  "/image/upload",
  Middlewares.Auth.authorize(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Multer.validateFiles({
    type: "single",
    fieldName: "image",
  }),
  Middlewares.Response.catchAsync(Controllers.uploadSingleImage)
);

// For Multiple Images Upload
router.post(
  "/images/upload",
  Middlewares.Auth.authorize(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Multer.validateFiles({
    type: "array",
    fieldName: "images",
    maxCount: 10,
  }),
  Middlewares.Response.catchAsync(Controllers.uploadMultipleImages)
);

// For Single Image Remove
router.delete(
  "/image/delete",
  Middlewares.Auth.authorize(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Response.catchAsync(Controllers.removeSingleImage)
);

// For Multiple Images Remove
router.delete(
  "/images/delete",
  Middlewares.Auth.authorize(["MASTER", "ADMIN", "SELLER"]),
  Middlewares.Response.catchAsync(Controllers.removeMultipleImages)
);

// ========== Video Upload ==========
// For Home Carousel Video Upload
router.post(
  "/video/upload",
  Middlewares.Auth.authorize(["MASTER"]),
  Middlewares.Multer.validateFiles({
    type: "fields",
    fieldsConfig: [
      { name: "video", maxCount: 1 },
      { name: "poster", maxCount: 1 },
    ],
  }),
  Middlewares.Response.catchAsync(Controllers.uploadHomeVideo)
);

// Home Carousel Video Routes
router.get(
  "/videos/home",
  Middlewares.Response.catchAsync(Controllers.getAllHomeVideos)
);
