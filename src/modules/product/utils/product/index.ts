export const isSafePopulateField = <T extends readonly string[]>(
  field: string,
  allowedFields: T
): field is T[number] => {
  return allowedFields.includes(field as T[number]);
};

export function typedObjectEntries<T extends object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

import { AppError } from "../../../../classes";
import { validateZodNumber, validateZodString } from "../../../../utils";
import { ValidateProductFieldProps } from "../../types";

export const validateProductField = (props: ValidateProductFieldProps) => {
  const {
    field,
    parentField,
    min,
    max,
    blockMultipleSpaces = false,
    blockSingleSpace = false,
    nonEmpty = false,
    customRegex,
  } = props;

  const nestedField = parentField ? `${parentField}.${field}` : field;

  switch (field) {
    case "title":
    case "brand":
    case "description":
    case "howToUse":
    case "ingredients":
    case "additionalDetails":
    case "description": {
      return validateZodString({
        field,
        parentField,
        max,
        min,
        blockSingleSpace,
        nonEmpty,
        blockMultipleSpaces,
        customRegex,
      });
    }
    case "originalPrice":
    case "sellingPrice":
    case "totalStock": {
      return validateZodNumber({
        field: "stock",
        parentField: "shades[some_index]",
        min: 5,
        mustBeInt: true,
      });
    }
    default:
      throw new AppError(
        `Validation for field '${nestedField}' is not implemented.`,
        500
      );
  }
};
