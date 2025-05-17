import { Router } from "express";

import { BLOGS_THUMBNAILS } from "../constants";
import {
  editBlogController,
  getAllBlogsController,
  getBlogByIdController,
  uploadBlogController,
} from "../controllers";
import {
  ResponseMiddleware,
  AuthMiddleware,
  MulterMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { editBlogZodSchema, uploadBlogZodSchema } from "../validations";

export const blogRouter = Router();

// All Blogs Route
blogRouter.get("/all", ResponseMiddleware.catchAsync(getAllBlogsController));

// Get Blog By Id Route
blogRouter.get(
  "/blog/:id",
  ResponseMiddleware.catchAsync(getBlogByIdController)
);

// Blog Upload Route
blogRouter.post(
  "/blog/upload",
  AuthMiddleware.authorization(["ADMIN", "SELLER", "MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  ZodMiddleware.validateZodSchema(uploadBlogZodSchema),
  ResponseMiddleware.catchAsync(uploadBlogController)
);

// Blog Edit Route
blogRouter.patch(
  "/blog/edit/:id",
  AuthMiddleware.authorization(["ADMIN", "SELLER", "MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  ZodMiddleware.validateZodSchema(editBlogZodSchema),
  ResponseMiddleware.catchAsync(editBlogController)
);

// Blog Delete Route
blogRouter.delete("/blog/delete/:id", () => {});
