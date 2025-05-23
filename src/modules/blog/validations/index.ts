import { z } from "zod";
import { validateBlogField } from "../utils";
import { validateZodDate } from "../../../utils";

const blogSchema = z.object({
  mainTitle: validateBlogField({
    field: "mainTitle",
    blockMultipleSpaces: true,
    min: 2,
  }),
  subTitle: validateBlogField({
    field: "subTitle",
    blockMultipleSpaces: true,
    min: 2,
  }),
  content: validateBlogField({
    field: "content",
    min: 10,
    blockMultipleSpaces: true,
  }),
  description: validateBlogField({
    field: "description",
    min: 10,
    blockMultipleSpaces: true,
  }),
  publishedDate: validateZodDate({
    field: "publishedDate",
    mustBePastDate: true,
  }),
  author: validateBlogField({ field: "author", blockMultipleSpaces: true, min: 2 }),
  tags: validateBlogField({
    field: "tags",
    min: 2,
    max: 20,
    blockMultipleSpaces: true,
  }),
});

export const uploadBlogZodSchema = blogSchema;
export const editBlogZodSchema = blogSchema.partial();
