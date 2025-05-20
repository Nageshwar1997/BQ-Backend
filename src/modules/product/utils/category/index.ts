import { ValidateCategoryFieldProps } from "../../types";
import { AppError } from "../../../../classes";
import { validateZodString } from "../../../../utils";

export const validateCategoryField = (props: ValidateCategoryFieldProps) => {
  const {
    field,
    parentField,
    min,
    max,
    blockMultipleSpaces = false,
    blockSingleSpace = false,
    nonEmpty = false,
  } = props;

  const nestedField = parentField ? `${parentField}.${field}` : field;

  switch (field) {
    case "name":
    case "category": {
      return validateZodString({
        field,
        parentField,
        max,
        min,
        blockSingleSpace,
        nonEmpty,
        blockMultipleSpaces,
      });
    }
    default:
      throw new AppError(
        `Validation for field '${nestedField}' is not implemented.`,
        500
      );
  }
};
