import Joi from "joi";

export const uploadProductValidationSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .pattern(/^(?!.*\s{2,}).*$/)
    .required()
    .messages({
      "string.base": "Title must be a string.",
      "string.empty": "Title is required.",
      "string.min": "Title must be at least 2 characters.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  brand: Joi.string()
    .pattern(/^(?!.*\s{2,}).*$/)
    .required()
    .messages({
      "string.base": "Subtitle must be a string.",
      "string.empty": "Subtitle is required.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  originalPrice: Joi.number().integer().min(1).required().messages({
    "number.base": "Original price must be a number.",
    "number.empty": "Original price is required.",
    "number.min": "Original price must be at least 1.",
    "number.integer": "Original price must be an integer.",
  }),
  sellingPrice: Joi.number().integer().min(1).required().messages({
    "number.base": "Selling price must be a number.",
    "number.empty": "Selling price is required.",
    "number.min": "Selling price must be at least 1.",
    "number.integer": "Selling price must be an integer.",
  }),
  totalStock: Joi.number().integer().min(5).required().messages({
    "number.base": "Total stock must be a number.",
    "number.empty": "Total stock is required.",
    "number.min": "Total stock must be at least 5.",
    "number.integer": "Total stock must be an integer.",
  }),
  description: Joi.string()
    .min(10)
    .pattern(/^(?!.* {2,}).*$/)
    .required()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description is required.",
      "string.min": "Description must be at least 10 characters.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  howToUse: Joi.string()
    .min(10)
    .pattern(/^(?!.*\s{2,}).*$/)
    .allow("")
    .default("")
    .optional()
    .messages({
      "string.base": "How to use must be a string.",
      "string.min": "How to use must be at least 10 characters.",
      "string.pattern.base": "Multiple spaces are not allowed.",
    }),
  ingredients: Joi.string()
    .min(10)
    .pattern(/^(?!.*\s{2,}).*$/)
    .allow("")
    .default("")
    .optional()
    .messages({
      "string.base": "Ingredients must be a string.",
      "string.min": "Ingredients must be at least 10 characters.",
      "string.pattern.base": "Multiple spaces are not allowed.",
    }),
  additionalDetails: Joi.string()
    .min(10)
    .pattern(/^(?!.*\s{2,}).*$/)
    .allow("")
    .default("")
    .optional()
    .messages({
      "string.base": "Additional details must be a string.",
      "string.min": "Additional details must be at least 10 characters.",
      "string.pattern.base": "Multiple spaces are not allowed.",
    }),
  categoryLevelOne: Joi.string().required().messages({
    "string.base": "Category Level One must be a string.",
    "string.empty": "Category Level One is required.",
  }),
  categoryLevelTwo: Joi.string().required().messages({
    "string.base": "Category Level Two must be a string.",
    "string.empty": "Category Level Two is required.",
  }),
  categoryLevelThree: Joi.string().required().messages({
    "string.base": "Category Level Three must be a string.",
    "string.empty": "Category Level Three is required.",
  }),
});
