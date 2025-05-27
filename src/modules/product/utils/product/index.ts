import { AppError } from "../../../../classes";
import { validateZodNumber, validateZodString } from "../../../../utils";
import { ValidateProductFieldConfigs } from "../../types";

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

export const validateProductField = (props: ValidateProductFieldConfigs) => {
  const { field, parentField, nonEmpty = true, nonNegative = true } = props;

  const nestedField = parentField
    ? `${parentField}${parentField.includes("[") ? " " : "."}${field}`
    : field;

  switch (field) {
    // For all string fields
    // For product main fields
    case "additionalDetails":
    case "brand":
    case "description":
    case "howToUse":
    case "ingredients":
    case "title":
    // For Shades Field
    case "colorCode":
    case "shadeName":
    // For Category
    case "category":
    case "name": {
      return validateZodString({ ...props, nonEmpty });
    }
    // For all number fields
    // For product main fields
    case "totalStock":
    case "originalPrice":
    case "sellingPrice":
    // For Shades Field
    case "stock": {
      return validateZodNumber({
        ...props,
        nonNegative,
      });
    }

    default: {
      throw new AppError(
        `Validation for field '${nestedField}' is not implemented.`,
        500
      );
    }
  }
};
