import { Request, Response } from "express";
import { Blog } from "../models";
import { Classes } from "../../../shared";

export const getAllBlogsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const skip = (page - 1) * limit;

  const blogs = await Blog.find()
    .skip(page && limit ? skip : 0)
    .limit(page && limit ? limit : 0)
    .lean();

  if (!blogs) {
    throw new Classes.AppError("Blogs not found", 404);
  }

  const totalBlogs = await Blog.countDocuments();

  res.success(200, "Blogs fetched successfully", {
    blogs,
    totalBlogs,
    currentPage: page ? page : 1,
    totalPages: page && limit ? Math.ceil(totalBlogs / limit) : 1,
  });
};
