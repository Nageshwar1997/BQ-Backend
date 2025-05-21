import { z } from "zod";
import { validateProductField } from "../../utils";

export const uploadProductZodSchema = z.object({
  // No need to validate title, it is already validated in the category validation middleware
  brand: validateProductField({
    field: "brand",
    min: 1,
    blockMultipleSpaces: true,
    nonEmpty: true,
  }),

  originalPrice: validateProductField({
    field: "originalPrice",
    min: 1,
    mustBeInt: true,
    nonNegative: true,
  }),

  sellingPrice: validateProductField({
    field: "sellingPrice",
    min: 1,
    mustBeInt: true,
    nonNegative: true,
  }),

  totalStock: validateProductField({
    field: "totalStock",
    min: 5,
    mustBeInt: true,
    nonNegative: true,
  }),

  description: validateProductField({
    field: "description",
    min: 10,
    blockMultipleSpaces: true,
    nonEmpty: true,
  }),

  howToUse: validateProductField({
    field: "howToUse",
    min: 10,
    blockMultipleSpaces: true,
    nonEmpty: true,
    isOptional: true,
  }),

  ingredients: validateProductField({
    field: "ingredients",
    min: 10,
    blockMultipleSpaces: true,
    nonEmpty: true,
    isOptional: true,
  }),

  additionalDetails: validateProductField({
    field: "additionalDetails",
    min: 10,
    blockMultipleSpaces: true,
    nonEmpty: true,
    isOptional: true,
  }),
});
