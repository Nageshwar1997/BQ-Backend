import { z } from "zod";
import { validateField } from "../utils";

const commonRequirements = {
  isString: true,
  min: 10,
  max: 100,
  checkSpace: true,
  nonEmpty: true,
};

export const uploadBlogZodSchema = z.object({
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
  publisher: validateField({
    field: "publisher",
    ...commonRequirements,
    min: 2,
    max: 50,
  }),
  tags: validateField({ field: "tags" }),
  publishedDate: validateField({ field: "publishedDate" }),
  smallThumbnail: validateField({ field: "smallThumbnail" }),
  largeThumbnail: validateField({ field: "largeThumbnail" }),
});
