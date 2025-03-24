import { NextFunction, Request, Response } from "express";
import { Blog } from "models/index";
import {
  SuccessResponse,
  CatchErrorResponse,
  isValidMongoId,
} from "utils/index";
import { AppError } from "constructors/index";
import { imageUploader, imageRemover } from "utils/mediaUploader";
import { AuthorizedRequest } from "types/index";
import { BLOGS_THUMBNAILS, MAX_IMAGE_FILE_SIZE } from "constants/index";
import {
  uploadBlogValidationSchema,
  editBlogValidationSchema,
} from "validations/blog.validation";

const uploadBlog = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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
      throw new AppError(
        "Blog already exists with Main Title OR Subtitle",
        400
      );
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Type Assertion

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
        const file = files[item]?.[0]; // Extract file
        if (!file) return;

        const uploadResult = await imageUploader({
          file,
          folder: "Blogs",
        });

        thumbnails[item] = uploadResult.secure_url;
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

    const { error } = uploadBlogValidationSchema.validate(cleanedData);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const blog = await Blog.create(cleanedData);

    if (!blog) {
      throw new AppError("Failed to upload blog", 400);
    }

    SuccessResponse(res, 201, "Blog uploaded successfully", { blog });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    let blogs;

    if (page && limit) {
      blogs = await Blog.find().skip(skip).limit(limit).lean();
    } else {
      blogs = await Blog.find().lean();
    }

    if (!blogs) {
      throw new AppError("Blogs not found", 404);
    }

    const totalBlogs = await Blog.countDocuments();

    SuccessResponse(res, 200, "Blogs fetched successfully", {
      blogs,
      totalBlogs,
      currentPage: page ? page : 1,
      totalPages: page && limit ? Math.ceil(totalBlogs / limit) : 1,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isValidId = isValidMongoId(id);

    if (!isValidId) {
      throw new AppError("Invalid Blog Id provided", 404);
    }

    const blog = await Blog.findById(id).lean();

    if (!blog) {
      throw new AppError("Blog not found", 404);
    }

    SuccessResponse(res, 200, "Blog fetched successfully", { blog });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

const editBlog = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const isValidId = isValidMongoId(id);

    if (!isValidId) {
      throw new AppError("Invalid Blog Id provided for Update Blog", 404);
    }

    const {
      mainTitle,
      subTitle,
      author,
      description,
      content,
      tags,
      publishedDate,
    } = req.body;

    let updateBody: Record<string, any> = {};
    let uploadedKeys: ("smallThumbnail" | "largeThumbnail")[] = []; // Store uploaded file keys

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new AppError("Blog not found", 404);
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

          const uploadResult = await imageUploader({
            file,
            folder: "Blogs",
          });

          updateBody[item] = uploadResult.secure_url;
          uploadedKeys.push(item as "smallThumbnail" | "largeThumbnail"); // Store uploaded key
        })
      );
    }

    if (mainTitle) {
      updateBody.mainTitle = mainTitle;
    }
    if (subTitle) {
      updateBody.subTitle = subTitle;
    }
    if (author) {
      updateBody.author = author;
    }
    if (description) {
      updateBody.description = description;
    }
    if (content) {
      updateBody.content = content;
    }
    if (tags) {
      updateBody.tags = JSON.parse(tags);
    }
    if (publishedDate) {
      updateBody.publishedDate = publishedDate;
    }

    const { error } = editBlogValidationSchema.validate(updateBody);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateBody, {
      new: true,
    }).lean();

    if (!updatedBlog) {
      throw new AppError("Failed to edit blog", 400);
    }

    if (uploadedKeys.length > 0) {
      await Promise.all(uploadedKeys.map((key) => imageRemover(blog[key]))); // Removed old images
    }
    SuccessResponse(res, 201, "Blog edited successfully", {
      blog: updatedBlog,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export { uploadBlog, getAllBlogs, getBlogById, editBlog };
