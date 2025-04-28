import { Response } from "express";

import { BLOGS_THUMBNAILS } from "../constants";
import { MAX_IMAGE_FILE_SIZE } from "../../../constants";
import { AppError } from "../../../classes";
import { Blog } from "../models";
import { AuthorizedRequest } from "../../../types";
import { getCloudinaryOptimizedUrl } from "../../../utils";
import { uploadBlogJoiSchema } from "../validations";
import { MediaModule } from "../..";

export const uploadBlogController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const {
    mainTitle,
    subTitle,
    author,
    description,
    content,
    tags,
    publishedDate,
  } = {
    mainTitle: req.body.mainTitle,
    subTitle: req.body.subTitle,
    author: req.body.author,
    description: req.body.description,
    content: req.body.content,
    tags: JSON.parse(req.body.tags),
    publishedDate: req.body.publishedDate,
  };

  const isExistBlog = await Blog.findOne({
    $or: [
      { mainTitle: { $regex: new RegExp(mainTitle, "i") } },
      { subTitle: { $regex: new RegExp(subTitle, "i") } },
    ],
  }).lean();

  if (isExistBlog) {
    throw new AppError("Blog already exists with Main Title OR Subtitle", 400);
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (files) {
    for (const file of BLOGS_THUMBNAILS) {
      if (files[file] && files[file][0].size > MAX_IMAGE_FILE_SIZE) {
        throw new AppError(
          `${file} file (${(files[file][0].size / (1024 * 1024)).toFixed(
            2
          )}MB) exceeds 2MB.`,
          400
        );
      }
    }
  }

  const thumbnails: Record<string, string> = {};

  await Promise.all(
    BLOGS_THUMBNAILS.map(async (item) => {
      const file = files[item]?.[0];
      if (!file) return;

      const uploadResult = await MediaModule.Utils.singleImageUploader({
        file,
        folder: "Blogs",
        cloudinaryConfigOption: "image",
      });

      thumbnails[item] = getCloudinaryOptimizedUrl(uploadResult.secure_url);
    })
  );

  const user = req.user;

  const cleanedData = {
    mainTitle,
    subTitle,
    author,
    description,
    content,
    tags,
    publishedDate,
    publisher: user?._id,
    ...thumbnails,
  };

  const { error } = uploadBlogJoiSchema.validate(cleanedData);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new AppError(errorMessage, 400);
  }

  try {
    const blog = await Blog.create(cleanedData);

    if (!blog) {
      throw new AppError("Failed to upload blog", 400);
    }

    res.success(201, "Blog uploaded successfully", { blog });
  } catch (error) {
    await Promise.all(
      BLOGS_THUMBNAILS.map(async (item) => {
        const thumbnail = thumbnails[item];
        if (thumbnail) {
          await MediaModule.Utils.singleImageRemover(thumbnail, "image");
        }
      })
    );

    throw error;
  }
};
