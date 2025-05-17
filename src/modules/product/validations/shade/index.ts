import { z } from "zod";

export const addShadeZodSchema = z.array(
  z.object({
    shadeName: z
      .string({
        required_error: "Shade name is required.",
        invalid_type_error: "Shade name must be a string.",
      })
      .trim()
      .min(1, "Shade name is required."),
    colorCode: z
      .string({
        required_error: "Color code is required.",
        invalid_type_error: "Color code must be a string.",
      })
      .trim()
      .min(1, "Color code is required."),
    images: z
      .array(z.string().trim())
      .optional()
      .refine((arr) => arr?.every((img) => typeof img === "string"), {
        message: "Images must be an array of strings.",
        path: ["images"],
      }),
    stock: z
      .number({
        required_error: "Stock is required.",
        invalid_type_error: "Stock must be a number.",
      })
      .int("Stock must be an integer.")
      .min(1, "Stock must be at least 1."),
  })
);
