import { z } from "zod";
import { validateProductField } from "../../utils";
import { createCategoryZodSchema } from "../category";
import { addShadesZodSchema } from "../shade";
import { TProductFieldOnly, ValidateProductFieldConfigs } from "../../types";
import { validateZodString } from "../../../../utils";

const common: Record<
  "text" | "optional" | "number",
  Partial<ValidateProductFieldConfigs>
> = {
  text: { min: 2, blockMultipleSpaces: true },
  optional: { min: 10, isOptional: true, nonEmpty: false },
  number: { min: 1, nonNegative: true },
};

const uploadProductFields: Record<
  TProductFieldOnly,
  ValidateProductFieldConfigs
> = {
  title: { ...common.text, field: "title" },
  brand: { ...common.text, min: 1, field: "brand" },
  originalPrice: { ...common.number, field: "originalPrice" },
  sellingPrice: { ...common.number, field: "sellingPrice" },
  totalStock: {
    ...common.number,
    field: "totalStock",
    min: 5,
    mustBeInt: true,
  },
  description: { ...common.text, min: 10, field: "description" },
  howToUse: { ...common.text, ...common.optional, field: "howToUse" },
  ingredients: { ...common.text, ...common.optional, field: "ingredients" },
  additionalDetails: {
    ...common.text,
    ...common.optional,
    field: "additionalDetails",
  },
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
  shades: addShadesZodSchema({ isOptional: false, _idOptional: true })
    .optional()
    .default([]),
});

export const updateProductZodSchema = z.object({
  ...Object.fromEntries(
    Object.entries(uploadProductFields).map(([key, props]) => [
      key,
      validateProductField({ ...props, isOptional: true }),
    ])
  ),
  categoryLevelOne: createCategoryZodSchema("categoryLevelOne").optional(),
  categoryLevelTwo: createCategoryZodSchema("categoryLevelTwo").optional(),
  categoryLevelThree: createCategoryZodSchema("categoryLevelThree").optional(),
  newAddedShades: addShadesZodSchema({
    isOptional: false,
    _idOptional: true,
    parentField: "newAddedShades[some_index]",
  }).optional(),
  updatedShadeWithFiles: addShadesZodSchema({
    isOptional: true,
    _idOptional: false,
    parentField: "updatedShadeWithFiles[some_index]",
  }).optional(),
  updatedShadeWithoutFiles: addShadesZodSchema({
    isOptional: true,
    _idOptional: false,
    parentField: "updatedShadeWithoutFiles[some_index]",
  }).optional(),
  removingCommonImageURLs: z
    .array(
      validateZodString({
        field: "removingCommonImageURLs[some_index]",
        blockSingleSpace: true,
        customRegex: {
          regex: /^(https?:\/\/)[^\s/$.?#].[^\s]*$/,
          message: "Invalid URL",
        },
      })
    )
    .optional(),
  removingShades: z
    .array(
      validateZodString({
        field: "_id",
        parentField: "removingCommonImageURLs[some_index]",
        blockSingleSpace: true,
      })
    )
    .optional(),
  removingShadeImageUrls: z
    .array(
      z.object({
        _id: validateZodString({
          field: "_id",
          parentField: "removingShades[some_index]",
          blockSingleSpace: true,
        }),
        urls: z.array(
          validateZodString({
            field: "urls",
            parentField: "removingShades[some_index]",
            blockSingleSpace: true,
          })
        ),
      })
    )
    .optional(),
});
