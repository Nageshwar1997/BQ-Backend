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
  MulterMiddleware,
  ZodMiddleware,
  RequestMiddleware,
  JSONParseMiddleware,
  Middlewares,
} from "../../../Middlewares";
import { editBlogZodSchema, uploadBlogZodSchema } from "../validations";

export const blogRouter = Router();

// All Blogs Route
blogRouter.get("/all", ResponseMiddleware.catchAsync(getAllBlogsController));

// Get Blog By Id Route
blogRouter.get(
  "/blog/:id",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsync(getBlogByIdController),
);

// Blog Upload Route
blogRouter.post(
  "/blog/upload",
  Middlewares.Auth.Authorization(["ADMIN", "SELLER", "MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  RequestMiddleware.checkEmptyRequest({ body: true, files: true }),
  JSONParseMiddleware.JSONParse({ fieldsToParse: ["tags"] }),
  ZodMiddleware.validateZodSchema(uploadBlogZodSchema),
  ResponseMiddleware.catchAsync(uploadBlogController),
);

// Blog Edit Route
blogRouter.patch(
  "/blog/edit/:id",
  Middlewares.Auth.Authorization(["ADMIN", "SELLER", "MASTER"]),
  MulterMiddleware.validateFiles({
    type: "fields",
    fieldsConfig: BLOGS_THUMBNAILS.map((thumbnail) => ({
      name: thumbnail,
      maxCount: 1,
    })),
  }),
  RequestMiddleware.checkEmptyRequest({ fileOrBody: true, params: true }),
  ZodMiddleware.validateZodSchema(editBlogZodSchema),
  ResponseMiddleware.catchAsync(editBlogController),
);

// Blog Delete Route
blogRouter.delete("/blog/delete/:id", () => {});
