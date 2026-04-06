import { Router } from "express";

import { BLOGS_THUMBNAILS } from "../constants";
import {
  editBlogController,
  getAllBlogsController,
  getBlogByIdController,
  uploadBlogController,
} from "../controllers";
import { Middlewares } from "../../../Middlewares";
import { editBlogZodSchema, uploadBlogZodSchema } from "../validations";

export const blogRouter = Router();

// All Blogs Route
blogRouter.get(
  "/all",
  Middlewares.Response.Async.TryCatch(getAllBlogsController),
);

// Get Blog By Id Route
blogRouter.get(
  "/blog/:id",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Response.Async.TryCatch(getBlogByIdController),
);

// Blog Upload Route
blogRouter.post(
  "/blog/upload",
  Middlewares.Auth.Authorization(["ADMIN", "SELLER", "MASTER"]),
  Middlewares.Multer({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  Middlewares.Request.Empty({ body: true, files: true }),
  Middlewares.JSONParser({ fieldsToParse: ["tags"] }),
  Middlewares.Zod(uploadBlogZodSchema),
  Middlewares.Response.Async.TryCatch(uploadBlogController),
);

// Blog Edit Route
blogRouter.patch(
  "/blog/edit/:id",
  Middlewares.Auth.Authorization(["ADMIN", "SELLER", "MASTER"]),
  Middlewares.Multer({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  Middlewares.Request.Empty({ fileOrBody: true, params: true }),
  Middlewares.Zod(editBlogZodSchema),
  Middlewares.Response.Async.TryCatch(editBlogController),
);

// Blog Delete Route
blogRouter.delete("/blog/delete/:id", () => {});
