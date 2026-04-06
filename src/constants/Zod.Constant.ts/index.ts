import { IZodStringConfigs } from "../../types";
import { Regex } from "../Regex.Constant.ts";

const zodStringOptions: Record<
  "email" | "phoneNumber" | "password" | "name" | "otp",
  IZodStringConfigs
> = {
  email: {
    allowSpace: "noSpace",
    field: "email",
    label: "Email",
    lowerOrUpper: "lower",
    customRegex: { regex: Regex.email, message: "must be valid" },
  },
  phoneNumber: {
    field: "phoneNumber",
    label: "Phone number",
    allowSpace: "noSpace",
    customRegexes: [
      {
        regex: Regex.phoneStart,
        message: "must be start with 6, 7, 8, or 9",
      },
      { regex: Regex.phoneExactLength, message: "must be exactly 10 digits" },
      {
        regex: Regex.phone,
        message: "must be exactly 10 digits and must start with 6, 7, 8, or 9",
      },
    ],
  },
  password: {
    field: "password",
    label: "Password",
    allowSpace: "noSpace",
    min: 6,
    max: 20,
    customRegexes: [
      {
        regex: Regex.atLeastOneUppercaseLetter,
        message: "must contain at least one uppercase letter",
      },
      {
        regex: Regex.atLeastOneLowercaseLetter,
        message: "must contain at least one lowercase letter",
      },
      {
        regex: Regex.atLeastOneDigit,
        message: "must contain at least one number",
      },
      {
        regex: Regex.atLeastOneSpecialCharacter,
        message: "must contain at least one special character e.g. @$!%*?&#",
      },
      {
        regex: Regex.password,
        message:
          "must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    ],
  },
  name: {
    field: "name",
    label: "Name",
    min: 2,
    max: 50,
    allowSpace: "singleSpace",
    customRegex: { regex: Regex.name, message: "can only contain letters" },
  },
  otp: {
    field: "otp",
    label: "OTP",
    min: 6,
    max: 6,
    allowSpace: "noSpace",
    customRegex: { regex: Regex.otp, message: "must be 6 digits" },
  },
};

export const ZodConstants = {
  StringOptions: zodStringOptions,
};
