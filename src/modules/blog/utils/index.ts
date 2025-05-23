import { z } from "zod";
import { AppError } from "../../../classes";
import { ValidateBlogFieldProps } from "../types";
import { validateZodDate, validateZodString } from "../../../utils";

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
    mustBePastDate,
    mustBeFutureDate,
  } = props;

  const commonConfigs: ValidateBlogFieldProps = {
    field,
    parentField,
    max,
    min,
    blockSingleSpace,
    nonEmpty,
    blockMultipleSpaces,
    customRegex,
    isOptional,
  };

  switch (field) {
    case "mainTitle":
    case "subTitle":
    case "author":
    case "description":
    case "content": {
      return validateZodString({ ...commonConfigs, field, parentField });
    }

    case "tags": {
      return z
        .array(
          validateZodString({
            ...commonConfigs,
            field: "tag",
            parentField: `${field}[some_index]`,
          }),
          {
            required_error: `'${field}' are required.`,
            invalid_type_error: `'${field}' must be an array of strings.`,
          }
        )
        .min(min ?? 1, {
          message: `At least 1 '${field.slice(0, -1)}' is required.`,
        })
        .max(max ?? 5, { message: `Maximum of 5 '${field}' are allowed.` })
        .nonempty({
          message: `At least 1 '${field.slice(0, -1)}' is required.`,
        })
        .refine(
          (tags) => {
            const trimmedTags = tags.map((tag) => tag?.trim().toLowerCase());
            return new Set(trimmedTags).size === trimmedTags.length;
          },
          { message: `Duplicate '${field}' are not allowed.` }
        );
    }

    case "publishedDate": {
      return validateZodDate({
        field,
        mustBePastDate,
        mustBeFutureDate,
        isOptional,
        parentField,
      });
    }

    default:
      throw new AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};
