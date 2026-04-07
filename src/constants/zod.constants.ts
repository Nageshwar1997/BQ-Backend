import { IZodStringConfigs } from "../types";
import { commonConstants } from "./common.constants";

const zodStringOptions: Record<
  "EMAIL" | "PHONE_NUMBER" | "PASSWORD" | "NAME" | "OTP",
  IZodStringConfigs
> = {
  EMAIL: {
    allowSpace: "noSpace",
    field: "email",
    label: "Email",
    lowerOrUpper: "lower",
    customRegex: {
      regex: commonConstants.regex.EMAIL,
      message: "must be valid",
    },
  },
  PHONE_NUMBER: {
    field: "phoneNumber",
    label: "Phone number",
    allowSpace: "noSpace",
    customRegexes: [
      {
        regex: commonConstants.regex.PHONE_START,
        message: "must be start with 6, 7, 8, or 9",
      },
      {
        regex: commonConstants.regex.PHONE_EXACT_LENGTH,
        message: "must be exactly 10 digits",
      },
      {
        regex: commonConstants.regex.PHONE,
        message: "must be exactly 10 digits and must start with 6, 7, 8, or 9",
      },
    ],
  },
  PASSWORD: {
    field: "password",
    label: "Password",
    allowSpace: "noSpace",
    min: 6,
    max: 20,
    customRegexes: [
      {
        regex: commonConstants.regex.AT_LEAST_ONE_UPPERCASE_LETTER,
        message: "must contain at least one uppercase letter",
      },
      {
        regex: commonConstants.regex.AT_LEAST_ONE_LOWERCASE_LETTER,
        message: "must contain at least one lowercase letter",
      },
      {
        regex: commonConstants.regex.AT_LEAST_ONE_DIGIT,
        message: "must contain at least one number",
      },
      {
        regex: commonConstants.regex.AT_LEAST_ONE_SPECIAL_CHARACTER,
        message: "must contain at least one special character e.g. @$!%*?&#",
      },
      {
        regex: commonConstants.regex.PASSWORD,
        message:
          "must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    ],
  },
  NAME: {
    field: "name",
    label: "Name",
    min: 2,
    max: 50,
    allowSpace: "singleSpace",
    customRegex: {
      regex: commonConstants.regex.NAME,
      message: "can only contain letters",
    },
  },
  OTP: {
    field: "otp",
    label: "OTP",
    min: 6,
    max: 6,
    allowSpace: "noSpace",
    customRegex: {
      regex: commonConstants.regex.OTP,
      message: "must be 6 digits",
    },
  },
};

export const zodConstants = {
  stringOptions: zodStringOptions,
};
