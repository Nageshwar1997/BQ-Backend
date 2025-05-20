import { z } from "zod";
import { validateField } from "../utils";

const commonRequirements = {
  isString: true,
  min: 10,
  max: 100,
  blockMultipleSpaces: true,
  nonEmpty: true,
};

const blogSchema = z.object({
  mainTitle: validateField({
    field: "mainTitle",
    ...commonRequirements,
    min: 2,
  }),
  subTitle: validateField({ field: "subTitle", ...commonRequirements, min: 2 }),
  content: validateField({
    field: "content",
    ...commonRequirements,
    max: undefined,
  }),
  description: validateField({
    field: "description",
    ...commonRequirements,
    max: undefined,
  }),
  author: validateField({ field: "author", ...commonRequirements, min: 2 }),
  tags: validateField({ field: "tags" }),
  publishedDate: validateField({ field: "publishedDate" }),
  smallThumbnail: validateField({ field: "smallThumbnail" }),
  largeThumbnail: validateField({ field: "largeThumbnail" }),
});

export const uploadBlogZodSchema = blogSchema;
export const editBlogZodSchema = blogSchema.partial();
