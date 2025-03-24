import { Router } from "express";
import { BLOGS_THUMBNAILS } from "../constants";
import {
  getAllBlogs,
  getBlogById,
  uploadBlog,
  editBlog,
} from "../controllers/blog.controller";
import isAuthenticated from "../middlewares/authentication.middleware";
import isAuthorized from "../middlewares/authorization.middleware";
import { validateImageFiles } from "../middlewares/fileValidation.middleware";

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
