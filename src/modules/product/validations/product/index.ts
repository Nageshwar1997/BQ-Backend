import { z } from "zod";
import { validateProductField } from "../../utils";
import { createCategoryZodSchema } from "../category";
import { addShadesZodSchema } from "../shade";
import { TProductFieldOnly, ValidateProductFieldProps } from "../../types";

const commonTextValidation: Partial<ValidateProductFieldProps> = {
  min: 2,
  blockMultipleSpaces: true,
};

const optionalTextValidation: Partial<ValidateProductFieldProps> = {
  ...commonTextValidation,
  min: 10,
  isOptional: true,
};

const numberValidation: Partial<ValidateProductFieldProps> = {
  min: 1,
  nonNegative: true,
};

const uploadProductFields: Record<
  TProductFieldOnly,
  ValidateProductFieldProps
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
