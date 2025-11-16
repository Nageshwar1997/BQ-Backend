import { Request, Response } from "express";
import { isValidMongoId } from "../../../utils";
import { AppError } from "../../../classes";
import { Blog } from "../models";

export const getBlogByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  isValidMongoId(id, "Invalid Blog Id provided", 404);

  const blog = await Blog.findById(id)
    .populate({
      path: "publisher",
      select: "firstName lastName profilePic -_id", // only these fields
    })
    .lean();

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  res.success(200, "Blog fetched successfully", { blog });
};
