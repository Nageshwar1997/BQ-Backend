import { Router } from "express";

import { BLOGS_THUMBNAILS } from "../constants";
import {
  editBlogController,
  getAllBlogsController,
  getBlogByIdController,
  uploadBlogController,
} from "../controllers";
import { middlewares } from "../../../middlewares";
import { editBlogZodSchema, uploadBlogZodSchema } from "../validations";

export const blogRouter = Router();

// All Blogs Route
blogRouter.get(
  "/all",
  middlewares.response.async.tryCatch(getAllBlogsController),
);

// Get Blog By Id Route
blogRouter.get(
  "/blog/:id",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatch(getBlogByIdController),
);

// Blog Upload Route
blogRouter.post(
  "/blog/upload",
  middlewares.auth.authorized(["ADMIN", "SELLER", "MASTER"]),
  middlewares.multer({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  middlewares.request.empty({ body: true, files: true }),
  middlewares.toJSON(["tags"]),
  middlewares.zod(uploadBlogZodSchema),
  middlewares.response.async.tryCatch(uploadBlogController),
);

// Blog Edit Route
blogRouter.patch(
  "/blog/edit/:id",
  middlewares.auth.authorized(["ADMIN", "SELLER", "MASTER"]),
  middlewares.multer({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  middlewares.request.empty({ fileOrBody: true, params: true }),
  middlewares.zod(editBlogZodSchema),
  middlewares.response.async.tryCatch(editBlogController),
);

// Blog Delete Route
blogRouter.delete("/blog/delete/:id", () => {});
