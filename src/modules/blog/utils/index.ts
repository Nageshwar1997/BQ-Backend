import { z } from "zod";

import { ALLOWED_IMAGE_TYPES, singleSpaceRegex } from "../../../constants";
import { Shared } from "../../..";
import { ValidateBlogFieldProps } from "../types";

export const validateField = (props: ValidateBlogFieldProps) => {
  const { field, min, max, checkSpace = false, nonEmpty = false } = props;

  switch (field) {
    case "mainTitle":
    case "subTitle":
    case "author":
    case "description":
    case "content": {
      let schema = z
        .string({
          required_error: `${field} is required.`,
          invalid_type_error: `${field} must be a text value.`,
        })
        .trim();

      if (nonEmpty) {
        schema = schema.nonempty({ message: `${field} cannot be empty.` });
      }

      if (min) {
        schema = schema.min(
          min,
          `${field} should be at least ${min} characters long.`
        );
      }

      if (max) {
        schema = schema.max(
          max,
          `${field} should not exceed ${max} characters.`
        );
      }

      if (checkSpace) {
        schema = schema.regex(
          singleSpaceRegex,
          `Field: '${field}' Only one space is allowed between words.`
        );
      }

      return schema;
    }

    case "tags": {
      return z
        .any()
        .refine((val) => val !== undefined && val !== null, {
          message: "Tags are required.",
        })
        .transform((val) => {
          if (typeof val === "string") {
            try {
              const parsed = JSON.parse(val);
              return parsed;
            } catch {
              return "__invalid_json__";
            }
          }
          return val;
        })
        .refine(
          (val) =>
            Array.isArray(val) && val.every((item) => typeof item === "string"),
          {
            message: "Tags must be a valid JSON array of strings.",
            path: ["tags"],
          }
        )
        .pipe(
          z
            .array(
              z
                .string()
                .trim()
                .nonempty({ message: "Tag cannot be empty." })
                .min(2, "Tag should be at least 2 characters long.")
                .max(20, "Tag should not exceed 20 characters.")
                .regex(
                  singleSpaceRegex,
                  `Field: '${field}' Only one space is allowed between words.`
                )
            )
            .min(1, "At least one tag is required.")
            .refine(
              (tags) => {
                const trimmedTags = tags.map((tag) => tag.trim().toLowerCase());
                return new Set(trimmedTags).size === trimmedTags.length;
              },
              { message: "Duplicate tags are not allowed." }
            )
        );
    }

    case "publishedDate": {
      return z
        .any()
        .refine((val) => val !== undefined && val !== null && val !== "", {
          message: "Published date is required.",
        })
        .transform((val) => {
          const date = new Date(val);
          return isNaN(date.getTime()) ? "__invalid_date__" : date;
        })
        .refine((val) => val !== "__invalid_date__", {
          message: "Invalid date format.",
        })
        .refine((val) => val <= new Date(), {
          message: "Publish date cannot be in the future.",
        });
    }

    case "smallThumbnail":
    case "largeThumbnail": {
      return z
        .any()
        .refine((val) => val !== undefined && val !== null, {
          message: `${field} is required.`,
        })
        .pipe(
          z.union([
            z
              .custom<Express.Multer.File>(
                (file) => !!file && typeof file === "object",
                {
                  message: `${field} is required.`,
                }
              )
              .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.mimetype), {
                message: `${field} must be an image of type: ${ALLOWED_IMAGE_TYPES.map(
                  (type) => type.split("/")[1]
                ).join(", ")}`,
              }),
            z
              .string({
                required_error: `${field} is required.`,
                invalid_type_error: `${field} must be a valid image URL.`,
              })
              .url(`${field} must be a valid URL.`)
              .refine(
                (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url),
                {
                  message: `${field} must be a valid image URL ending in .jpg, .png, etc.`,
                }
              ),
          ])
        );
    }

    default:
      throw new Shared.Classes.AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};
