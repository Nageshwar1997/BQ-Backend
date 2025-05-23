import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, singleSpaceRegex } from "../../../constants";
import { AppError } from "../../../classes";
import { ValidateBlogFieldProps } from "../types";
import { validateZodString } from "../../../utils";

export const validateBlogField = (props: ValidateBlogFieldProps) => {
  const {
    field,
    parentField,
    min,
    max,
    blockMultipleSpaces = false,
    blockSingleSpace = false,
    customRegex,
    isOptional = false,
    nonEmpty = false,
  } = props;

  switch (field) {
    case "mainTitle":
    case "subTitle":
    case "author":
    case "description":
    case "content": {
      return validateZodString({
        field,
        parentField,
        max,
        min,
        blockSingleSpace,
        nonEmpty,
        blockMultipleSpaces,
        customRegex,
        isOptional,
      });
    }

    case "tags": {
      return z
        .array(
          validateZodString({
            field: "tag",
            parentField: "tags[some_index]",
            max,
            min,
            blockSingleSpace,
            nonEmpty,
            blockMultipleSpaces,
            customRegex,
            isOptional,
          }),
          {
            required_error: "'tags' are required",
            invalid_type_error: "'tags' must be an array of strings.",
          }
        )
        .min(1, { message: "At least 1 'tag' is required." })
        .max(5, { message: "Maximum of 5 'tags' are allowed." })
        .nonempty({ message: "At least 1 'tag' is required." })
        .refine(
          (tags) => {
            const trimmedTags = tags.map((tag) => tag?.trim().toLowerCase());
            return new Set(trimmedTags).size === trimmedTags.length;
          },
          { message: "Duplicate tags are not allowed." }
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

    default:
      throw new AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};
