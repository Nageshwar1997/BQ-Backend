import Joi from "joi";
import { CategoryProps } from "../../types";

export const createCategoryValidationSchema: Joi.ObjectSchema<CategoryProps> =
  Joi.object({
    name: Joi.string()
      .required()
      .pattern(/^(?!.*\s{2,}).*$/)
      .messages({
        "string.base": "Category name must be a string.",
        "string.empty": "Category name is required.",
        "string.pattern.base": "Only one space is allowed between words.",
        "string.min": "Category name must be at least 2 characters.",
      }),
    level: Joi.number().required().messages({
      "any.required": "Category level is required.",
      "number.base": "Category level must be a number.",
    }),
    parentCategory: Joi.any().allow(null).messages({
      "any.only": "Parent category must be null or a valid value.",
    }),
  });
