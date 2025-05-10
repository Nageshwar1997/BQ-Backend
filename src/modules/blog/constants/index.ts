import { z } from "zod";
import { BlogProps, BlogThumbnailType } from "../types";
import { ALLOWED_IMAGE_TYPES, singleSpaceRegex } from "../../../constants";
import { AppError } from "../../../classes";

export const BLOGS_THUMBNAILS: BlogThumbnailType[] = [
  "smallThumbnail",
  "largeThumbnail",
];

export const possibleEditBlogFields = [
  "mainTitle",
  "subTitle",
  "author",
  "description",
  "content",
  "tags",
  "publishedDate",
];

export interface ValidateFieldProps {
  field: string;
  min?: number | undefined;
  max?: number | undefined;
  checkSpace?: boolean;
  nonEmpty?: boolean;
}

export const validateField = (props: ValidateFieldProps) => {
  const { field, min, max, checkSpace = false, nonEmpty = false } = props;

  switch (field) {
    case "mainTitle":
    case "subTitle":
    case "author":
    case "description":
    case "content":
    case "publisher": {
      let schema = z
        .string({
          required_error: `${field} is required.`,
          invalid_type_error: `${field} must be a text value.`,
        })

        .trim();

      if (nonEmpty) {
        schema = schema.nonempty({ message: `${field} cannot be empty.` });
      }
      // required_error: `${field} is required.`,

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
      return z.preprocess(
        (val) => {
          if (typeof val === "string") {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        },
        z
          .array(
            z
              .string({
                required_error: "Tag is required.",
                invalid_type_error: "Each tag must be a text value.",
              })
              .trim()
              .nonempty({ message: "Tag cannot be empty." })
              .min(2, "Tag should be at least 2 characters long.")
              .max(20, "Tag should not exceed 20 characters.")
              .regex(
                singleSpaceRegex,
                "Only one space is allowed between words."
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
      return z.preprocess(
        (val) =>
          typeof val === "string" || val instanceof Date ? new Date(val) : val,
        z
          .date({
            required_error: "Published date is required.",
            invalid_type_error: "Invalid date format.",
          })
          .max(new Date(), { message: "Publish date cannot be in the future." })
      );
    }

    case "smallThumbnail":
    case "largeThumbnail": {
      return z
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
        });
    }

    default:
      throw new AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};
