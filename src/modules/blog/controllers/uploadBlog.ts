import { Response } from "express";

import { BLOGS_THUMBNAILS } from "../constants";
import { Shared } from "../../..";
import { Blog } from "../models";
import { AuthorizedRequest } from "../../../types";
import { getCloudinaryOptimizedUrl } from "../../../utils";
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
  } = req.body;

  const isExistBlog = await Blog.findOne({
    $or: [
      { mainTitle: { $regex: new RegExp(mainTitle, "i") } },
      { subTitle: { $regex: new RegExp(subTitle, "i") } },
    ],
  }).lean();

  if (isExistBlog) {
    throw new Shared.Classes.AppError(
      "Blog already exists with Main Title OR Subtitle",
      400
    );
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const thumbnails: Record<string, string> = {};

  await Promise.all(
    BLOGS_THUMBNAILS.map(async (item) => {
      const file = files[item]?.[0];

      if (file) {
        const uploadResult = await MediaModule.Utils.singleImageUploader({
          file,
          folder: "Blogs",
          cloudinaryConfigOption: "image",
        });

        thumbnails[item] = getCloudinaryOptimizedUrl(uploadResult.secure_url);
      }
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

  try {
    const blog = await Blog.create(cleanedData);

    if (!blog) {
      throw new Shared.Classes.AppError("Failed to upload blog", 400);
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
