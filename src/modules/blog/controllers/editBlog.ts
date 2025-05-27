import { Response } from "express";

import { isValidMongoId } from "../../../utils";
import { AppError } from "../../../classes";
import { BlogThumbnailType } from "../types";
import { Blog } from "../models";
import { BLOGS_THUMBNAILS, possibleEditBlogFields } from "../constants";
import { AuthorizedRequest } from "../../../types";
import { MediaModule } from "../..";

export const editBlogController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { id } = req.params;

  const isValidId = isValidMongoId(id);

  if (!isValidId) {
    throw new AppError("Invalid Blog Id provided for Update Blog", 404);
  }

  let updateBody: Record<string, any> = {};
  let uploadedKeys: BlogThumbnailType[] = []; // Store uploaded file keys

  const blog = await Blog.findById(id).lean();

  if (!blog) {
    throw new AppError("Blog not found for update", 404);
  }

  const user = req.user;

  if (blog.publisher.toString() !== user?._id?.toString()) {
    throw new AppError("You are not authorized to edit this blog", 403);
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Type Assertion

  if (files) {
    await Promise.all(
      BLOGS_THUMBNAILS.map(async (item) => {
        const file = files[item]?.[0]; // Extract file
        if (!file) return;

        const uploadResult = await MediaModule.Utils.singleImageUploader({
          file,
          folder: "Blogs",
          cloudinaryConfigOption: "image",
        });
        updateBody[item] = uploadResult.secure_url;
        uploadedKeys.push(item); // Store uploaded key
      })
    );
  }

  for (const field of possibleEditBlogFields) {
    const value = req.body[field];
    if (value && value !== undefined && value !== null) {
      updateBody[field] = value;
    }
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateBody, {
      new: true,
    }).lean();

    res.success(201, "Blog edited successfully", {
      blog: updatedBlog,
    });

    if (!updatedBlog) {
      throw new AppError("Failed to edit blog", 400);
    }
  } catch (error) {
    if (uploadedKeys.length > 0) {
      await Promise.all(
        uploadedKeys.map((key) =>
          MediaModule.Utils.singleImageRemover(blog[key], "image")
        )
      ); // Removed old images
    }
    throw error;
  }
};
