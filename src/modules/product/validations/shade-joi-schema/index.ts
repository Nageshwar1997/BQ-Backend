import Joi from "joi";

export const addShadeJoiSchema = Joi.array().items(
  Joi.object({
    shadeName: Joi.string().trim().required().messages({
      "string.base": "Shade name must be a string.",
      "string.empty": "Shade name is required.",
    }),
    colorCode: Joi.string().trim().required().messages({
      "string.base": "Color code must be a string.",
      "string.empty": "Color code is required.",
    }),
    images: Joi.array().items(Joi.string().trim()).messages({
      "array.base": "Images must be an array of strings.",
      "string.base": "Each image must be a string.",
    }),
    stock: Joi.number().integer().min(1).required().messages({
      "number.base": "Stock must be a number.",
      "number.empty": "Stock is required.",
      "number.min": "Stock must be at least 1.",
      "number.integer": "Stock must be an integer.",
    }),
  })
);
