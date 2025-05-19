import { z } from "zod";

export const createCategorySchema = z.object(
  {
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
    category: z
      .string({
        required_error: "Category is required.",
        invalid_type_error: "Category must be a string.",
      })
      .trim()
      .nonempty({ message: "Category cannot be empty." })
      .min(2, { message: "Category must be at least 2 characters." })
      .regex(/^\S+$/, {
        message: "Spaces are not allowed in the category name.",
      }),
  },
  {
    required_error: "Category is required.",
    invalid_type_error: "Category must be an object.",
  }
);

export const createCategoryZodSchema = z.object({
  categoryLevelOne: createCategorySchema,
  categoryLevelTwo: createCategorySchema,
  categoryLevelThree: createCategorySchema,
});
