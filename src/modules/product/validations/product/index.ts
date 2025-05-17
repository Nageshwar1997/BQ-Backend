import { z } from "zod";

const noDoubleSpacesRegex = /^(?!.*\s{2,}).*$/;

export const uploadProductZodSchema = z.object({
  title: z
    .string({
      required_error: "Title is required.",
      invalid_type_error: "Title must be a string.",
    })
    .min(2, "Title must be at least 2 characters.")
    .regex(noDoubleSpacesRegex, "Only one space is allowed between words."),

  brand: z
    .string({
      required_error: "Subtitle is required.",
      invalid_type_error: "Subtitle must be a string.",
    })
    .regex(noDoubleSpacesRegex, "Only one space is allowed between words."),

  originalPrice: z
    .number({
      required_error: "Original price is required.",
      invalid_type_error: "Original price must be a number.",
    })
    .int("Original price must be an integer.")
    .min(1, "Original price must be at least 1."),

  sellingPrice: z
    .number({
      required_error: "Selling price is required.",
      invalid_type_error: "Selling price must be a number.",
    })
    .int("Selling price must be an integer.")
    .min(1, "Selling price must be at least 1."),

  totalStock: z
    .number({
      required_error: "Total stock is required.",
      invalid_type_error: "Total stock must be a number.",
    })
    .int("Total stock must be an integer.")
    .min(5, "Total stock must be at least 5."),

  description: z
    .string({
      required_error: "Description is required.",
      invalid_type_error: "Description must be a string.",
    })
    .min(10, "Description must be at least 10 characters.")
    .regex(noDoubleSpacesRegex, "Only one space is allowed between words."),

  howToUse: z
    .string({
      invalid_type_error: "How to use must be a string.",
    })
    .min(10, "How to use must be at least 10 characters.")
    .regex(noDoubleSpacesRegex, "Multiple spaces are not allowed.")
    .optional()
    .or(z.literal("")),

  ingredients: z
    .string({
      invalid_type_error: "Ingredients must be a string.",
    })
    .min(10, "Ingredients must be at least 10 characters.")
    .regex(noDoubleSpacesRegex, "Multiple spaces are not allowed.")
    .optional()
    .or(z.literal("")),

  additionalDetails: z
    .string({
      invalid_type_error: "Additional details must be a string.",
    })
    .min(10, "Additional details must be at least 10 characters.")
    .regex(noDoubleSpacesRegex, "Multiple spaces are not allowed.")
    .optional()
    .or(z.literal("")),

  categoryLevelOne: z
    .string({
      required_error: "Category Level One is required.",
      invalid_type_error: "Category Level One must be a string.",
    })
    .min(1, "Category Level One is required."),

  categoryLevelTwo: z
    .string({
      required_error: "Category Level Two is required.",
      invalid_type_error: "Category Level Two must be a string.",
    })
    .min(1, "Category Level Two is required."),

  categoryLevelThree: z
    .string({
      required_error: "Category Level Three is required.",
      invalid_type_error: "Category Level Three must be a string.",
    })
    .min(1, "Category Level Three is required."),
});
