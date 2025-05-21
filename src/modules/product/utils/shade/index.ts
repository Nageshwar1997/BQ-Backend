import { AppError } from "../../../../classes";
import { validateZodNumber, validateZodString } from "../../../../utils";
import { ValidateShadeFieldProps } from "../../types";

export const validateShadeField = (props: ValidateShadeFieldProps) => {
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
    case "shadeName":
    case "colorCode": {
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
    case "stock": {
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
