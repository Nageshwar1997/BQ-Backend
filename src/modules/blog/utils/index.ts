import { z } from "zod";
import { AppError } from "../../../classes";
import { ValidateBlogFieldConfigs } from "../types";
import { validateZodDate, validateZodString } from "../../../utils";

export const validateBlogField = (props: ValidateBlogFieldConfigs) => {
  const { field, nonEmpty = true } = props;
  switch (props.field) {
    case "mainTitle":
    case "subTitle":
    case "author":
    case "description":
    case "content": {
      return validateZodString({ ...props, nonEmpty });
    }

    case "tags": {
      return z
        .array(
          validateZodString({
            ...props,
            nonEmpty,
            field: "tag",
            parentField: `${field}[some_index]`,
          }),
          {
            required_error: `'${field}' are required.`,
            invalid_type_error: `'${field}' must be an array of strings.`,
          }
        )
        .nonempty({ message: `The '${field}' field cannot be empty.` })
        .min(1, { message: `At least 1 'tag' is required.` })
        .max(5, { message: `Maximum of 5 '${field}' are allowed.` })
        .refine(
          (tags) => {
            const trimmedTags = tags.map((tag) => tag?.trim().toLowerCase());
            return new Set(trimmedTags).size === trimmedTags.length;
          },
          { message: `Duplicate '${field}' are not allowed.` }
        );
    }

    case "publishedDate": {
      return validateZodDate(props);
    }

    default:
      throw new AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};
