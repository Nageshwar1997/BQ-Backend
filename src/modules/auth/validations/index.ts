import { z } from "zod";
import { validateZodString } from "../../../utils";
import {
  emailRegex,
  nameRegex,
  passwordRegex,
  phoneRegex,
} from "../../../constants";
import {
  TLoginFieldsOnly,
  TRegisterFieldsOnly,
  ValidateAuthFieldConfigs,
} from "../types";
import { AppError } from "../../../classes";

export const validateAuthField = (props: ValidateAuthFieldConfigs) => {
  switch (props.field) {
    case "firstName":
    case "lastName":
    case "email":
    case "password":
    case "phoneNumber":
    case "confirmPassword": {
      return validateZodString(props);
    }
    default:
      throw new AppError(
        `Validation for field '${props.field}' is not implemented.`,
        500
      );
  }
};

const customRegexes = {
  email: {
    regex: emailRegex,
    message: "please provide a valid email address, like example@domain.com",
  },
  name: {
    regex: nameRegex,
    message:
      "can only contain letters and only one space is allowed between words",
  },
  phoneNumber: {
    regex: phoneRegex,
    message:
      "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
  },
  password: {
    regex: passwordRegex,
    message:
      "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
  },
};

const common: Record<
  "text" | "password" | "phone",
  Partial<ValidateAuthFieldConfigs>
> = {
  text: { min: 2, max: 50, blockMultipleSpaces: true },
  password: { min: 6, max: 20, blockSingleSpace: true },
  phone: { min: 10, max: 10, blockSingleSpace: true },
};

const loginFieldValidations: Record<
  TLoginFieldsOnly,
  ValidateAuthFieldConfigs
> = {
  email: {
    field: "email",
    isOptional: true,
    blockSingleSpace: true,
    customRegex: customRegexes.email,
  },
  phoneNumber: {
    ...common.phone,
    isOptional: true,
    field: "phoneNumber",
    customRegex: customRegexes.phoneNumber,
  },
  password: {
    ...common.password,
    field: "password",
    customRegex: customRegexes.password,
  },
};

const registerFieldValidations: Record<
  TRegisterFieldsOnly,
  ValidateAuthFieldConfigs
> = {
  ...loginFieldValidations,
  email: { ...loginFieldValidations.email, isOptional: false },
  phoneNumber: { ...loginFieldValidations.phoneNumber, isOptional: false },
  firstName: {
    ...common.text,
    field: "firstName",
    customRegex: customRegexes.name,
  },
  lastName: {
    ...common.text,
    field: "lastName",
    customRegex: customRegexes.name,
  },
  confirmPassword: {
    ...common.password,
    field: "confirmPassword",
    customRegex: customRegexes.password,
  },
};

export const registerZodSchema = z
  .object(
    Object.fromEntries(
      Object.entries(registerFieldValidations).map(([key, config]) => [
        key,
        validateAuthField(config),
      ])
    )
  )
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

export const loginZodSchema = z
  .object(
    Object.fromEntries(
      Object.entries(loginFieldValidations).map(([key, config]) => [
        key,
        validateAuthField(config),
      ])
    )
  )
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required.",
    path: [],
  });
