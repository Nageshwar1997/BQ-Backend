import { z } from "zod";
import { validateProductField } from "../../utils";
import { createCategoryZodSchema } from "../category";
import { addShadesZodSchema } from "../shade";
import { TProductFieldOnly, ValidateProductFieldConfigs } from "../../types";

const commonTextValidation: Partial<ValidateProductFieldConfigs> = {
  min: 2,
  blockMultipleSpaces: true,
};

const optionalTextValidation: Partial<ValidateProductFieldConfigs> = {
  ...commonTextValidation,
  min: 10,
  isOptional: true,
};

const numberValidation: Partial<ValidateProductFieldConfigs> = {
  min: 1,
  nonNegative: true,
};

const uploadProductFields: Record<
  TProductFieldOnly,
  ValidateProductFieldConfigs
> = {
  title: { ...commonTextValidation, field: "title" },
  brand: { ...commonTextValidation, min: 1, field: "brand" },
  originalPrice: { ...numberValidation, field: "originalPrice" },
  sellingPrice: { ...numberValidation, field: "sellingPrice" },
  totalStock: {
    ...numberValidation,
    field: "totalStock",
    min: 5,
    mustBeInt: true,
  },
  description: { ...commonTextValidation, min: 10, field: "description" },
  howToUse: { ...optionalTextValidation, field: "howToUse" },
  ingredients: { ...optionalTextValidation, field: "ingredients" },
  additionalDetails: { ...optionalTextValidation, field: "additionalDetails" },
};

export const uploadProductZodSchema = z.object({
  ...Object.fromEntries(
    Object.entries(uploadProductFields).map(([key, props]) => [
      key,
      validateProductField(props),
    ])
  ),
  categoryLevelOne: createCategoryZodSchema("categoryLevelOne"),
  categoryLevelTwo: createCategoryZodSchema("categoryLevelTwo"),
  categoryLevelThree: createCategoryZodSchema("categoryLevelThree"),
  shades: addShadesZodSchema.optional().default([]),
});
