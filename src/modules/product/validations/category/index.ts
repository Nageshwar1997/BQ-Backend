import { z } from "zod";

export const createCategoryZodSchema = z.object({
  name: z
    .string({
      required_error: "Category name is required.",
      invalid_type_error: "Category name must be a string.",
    })
    .trim()
    .nonempty({ message: "Category name cannot be empty." })
    .min(2, { message: "Category name must be at least 2 characters." })
    .regex(/^(?!.*\s{2,}).*$/, {
      message: "Only one space is allowed between words.",
    }),
  level: z.number({
    required_error: "Category level is required.",
    invalid_type_error: "Category level must be a number.",
  }),
  parentCategory: z.union([z.string(), z.null()], {
    required_error: "Parent category is required.",
    invalid_type_error: "Parent category must be a string or null.",
  }),
});
