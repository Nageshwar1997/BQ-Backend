import { z } from "zod";
import { validateBlogField } from "../utils";
import { TBlogFieldOnly, ValidateBlogFieldConfigs } from "../types";

const common: Record<string, Partial<ValidateBlogFieldConfigs>> = {
  text: { min: 2, blockMultipleSpaces: true },
  content: { min: 10 },
};

const blogFieldValidations: Record<TBlogFieldOnly, ValidateBlogFieldConfigs> = {
  mainTitle: { ...common.text, field: "mainTitle" },
  subTitle: { ...common.text, field: "subTitle" },
  content: { ...common.text, ...common.content, field: "content" },
  description: { ...common.text, ...common.content, field: "description" },
  publishedDate: { field: "publishedDate", mustBePastDate: true },
  author: { ...common.text, field: "author" },
  tags: { ...common.text, max: 20, field: "tags" },
};

export const blogZodSchema = z.object(
  Object.fromEntries(
    Object.entries(blogFieldValidations).map(([key, config]) => [
      key,
      validateBlogField(config),
    ])
  )
);

export const uploadBlogZodSchema = blogZodSchema;
export const editBlogZodSchema = blogZodSchema.partial();
