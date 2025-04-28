import Joi from "joi";

export const editBlogJoiSchema = Joi.object({
  mainTitle: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^(?!.*\s{2,}).*$/)
    .optional()
    .messages({
      "string.base": "Main title must be a string.",
      "string.empty": "Main title cannot be empty.",
      "string.min": "Main title must be at least 2 characters.",
      "string.max": "Main title cannot exceed 100 characters.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  subTitle: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^(?!.*\s{2,}).*$/)
    .optional()
    .messages({
      "string.base": "Subtitle must be a string.",
      "string.empty": "Subtitle cannot be empty.",
      "string.min": "Subtitle must be at least 2 characters.",
      "string.max": "Subtitle cannot exceed 100 characters.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  content: Joi.string()
    .min(10)
    .pattern(/^(?!.*\s{2,}).*$/)
    .optional()
    .messages({
      "string.base": "Content must be a string.",
      "string.empty": "Content cannot be empty.",
      "string.min": "Content must be at least 10 characters.",
      "string.pattern.base": "Multiple spaces are not allowed.",
    }),
  description: Joi.string()
    .min(10)
    .pattern(/^(?!.* {2,}).*$/)
    .optional()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description cannot be empty.",
      "string.min": "Description must be at least 10 characters.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  author: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^(?!.*\s{2,}).*$/)
    .optional()
    .messages({
      "string.base": "Author must be a string.",
      "string.empty": "Author is required.",
      "string.min": "Author must be at least 2 characters.",
      "string.max": "Author cannot exceed 100 characters.",
      "string.pattern.base": "Only one space is allowed between words.",
    }),
  tags: Joi.array()
    .items(
      Joi.string().trim().required().messages({
        "string.empty": "Tag cannot be empty.",
      })
    )
    .optional()
    .messages({
      "array.base": "Tags must be an array of strings.",
      "array.includesRequiredUnknowns": "Each tag must be a non-empty string.",
    }),
  publishedDate: Joi.date().allow(null).optional().max("now").messages({
    "date.base": "Invalid date format.",
    "date.max": "Publish date cannot be in the future.",
  }),
  largeThumbnail: Joi.string().uri().pattern(/^\S+$/).optional().messages({
    "string.base": "Large thumbnail must be a string.",
    "string.empty": "Large thumbnail cannot be empty.",
    "string.uri": "Large thumbnail must be a valid URL.",
    "string.pattern.base": "Large thumbnail cannot contain spaces.",
  }),
  smallThumbnail: Joi.string().uri().pattern(/^\S+$/).optional().messages({
    "string.base": "Small thumbnail must be a string.",
    "string.empty": "Small thumbnail cannot be empty.",
    "string.uri": "Small thumbnail must be a valid URL.",
    "string.pattern.base": "Small thumbnail cannot contain spaces.",
  }),
});
