import { Router } from "express";
import {
  editBlog,
  getAllBlogs,
  getBlogById,
  uploadBlog,
} from "controllers/blog.controller";
import isAuthorized from "middlewares/authorization.middleware";
import { validateImageFiles } from "middlewares/fileValidation.middleware";
import { BLOGS_THUMBNAILS } from "constants/index";
import isAuthenticated from "middlewares/authentication.middleware";

const blogRouter = Router();

blogRouter.get("/all", getAllBlogs);
blogRouter.get("/blog/:id", getBlogById);
blogRouter.post(
  "/blog/upload",
  isAuthorized(["ADMIN", "USER", "MASTER"]),
  validateImageFiles(
    BLOGS_THUMBNAILS.map((thumbnail) => ({ name: thumbnail, maxCount: 1 }))
  ),
  uploadBlog
);
blogRouter.put(
  "/blog/edit/:id",
  isAuthenticated,
  validateImageFiles(
    BLOGS_THUMBNAILS.map((thumbnail) => ({ name: thumbnail, maxCount: 1 }))
  ),
  editBlog
);
blogRouter.delete("/blog/delete/:id", () => {});

export default blogRouter;
