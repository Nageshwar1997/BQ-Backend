import { Request, Response } from "express";
import { isValidMongoId } from "../../../utils";
import { Blog } from "../models";
import { Shared } from "../../..";

export const getBlogByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const isValidId = isValidMongoId(id);

  if (!isValidId) {
    throw new Shared.Classes.AppError("Invalid Blog Id provided", 404);
  }

  const blog = await Blog.findById(id).lean();

  if (!blog) {
    throw new Shared.Classes.AppError("Blog not found", 404);
  }

  res.success(200, "Blog fetched successfully", { blog });
};
