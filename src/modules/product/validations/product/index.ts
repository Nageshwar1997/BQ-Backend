import { z } from "zod";
import { validateProductField } from "../../utils";
import { createCategoryZodSchema } from "../category";
import { addShadesZodSchema } from "../shade";

export const uploadProductZodSchema = z.object({
  title: validateProductField({
    field: "title",
    blockMultipleSpaces: true,
    min: 2,
  }),

  brand: validateProductField({
    field: "brand",
    min: 1,
    blockMultipleSpaces: true,
  }),

  originalPrice: validateProductField({
    field: "originalPrice",
    min: 1,
    nonNegative: true,
  }),

  sellingPrice: validateProductField({
    field: "sellingPrice",
    min: 1,
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
  }),

  howToUse: validateProductField({
    field: "howToUse",
    min: 10,
    blockMultipleSpaces: true,
    isOptional: true,
  }),

  ingredients: validateProductField({
    field: "ingredients",
    min: 10,
    blockMultipleSpaces: true,
    isOptional: true,
  }),

  additionalDetails: validateProductField({
    field: "additionalDetails",
    min: 10,
    blockMultipleSpaces: true,
    isOptional: true,
  }),

  categoryLevelOne: createCategoryZodSchema("categoryLevelOne"),
  categoryLevelTwo: createCategoryZodSchema("categoryLevelTwo"),
  categoryLevelThree: createCategoryZodSchema("categoryLevelThree"),
  shades: addShadesZodSchema.optional().default([]),
});
