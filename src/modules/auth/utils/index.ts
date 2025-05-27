import { AppError } from "../../../classes";
import { validateZodString } from "../../../utils";
import { ValidateAuthFieldConfigs } from "../types";

export const validateAuthField = (props: ValidateAuthFieldConfigs) => {
  const { field, nonEmpty = true } = props;
  switch (field) {
    case "firstName":
    case "lastName":
    case "email":
    case "password":
    case "phoneNumber":
    case "confirmPassword": {
      return validateZodString({ ...props, nonEmpty });
    }
    default:
      throw new AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};
