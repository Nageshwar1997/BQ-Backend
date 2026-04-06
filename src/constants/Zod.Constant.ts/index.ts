import { IZodStringConfigs } from "../../types";
import { regexes } from "../Regex.Constant.ts";

export const zodStringOptions: Record<
  "email" | "phoneNumber" | "password" | "name" | "otp",
  IZodStringConfigs
> = {
  email: {
    allowSpace: "noSpace",
    field: "email",
    label: "Email",
    lowerOrUpper: "lower",
    customRegex: { regex: regexes.email, message: "must be valid" },
  },
  phoneNumber: {
    field: "phoneNumber",
    label: "Phone number",
    allowSpace: "noSpace",
    customRegexes: [
      {
        regex: regexes.phoneStart,
        message: "must be start with 6, 7, 8, or 9",
      },
      { regex: regexes.phoneExactLength, message: "must be exactly 10 digits" },
      {
        regex: regexes.phone,
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
        regex: regexes.atLeastOneUppercaseLetter,
        message: "must contain at least one uppercase letter",
      },
      {
        regex: regexes.atLeastOneLowercaseLetter,
        message: "must contain at least one lowercase letter",
      },
      {
        regex: regexes.atLeastOneDigit,
        message: "must contain at least one number",
      },
      {
        regex: regexes.atLeastOneSpecialCharacter,
        message: "must contain at least one special character e.g. @$!%*?&#",
      },
      {
        regex: regexes.password,
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
    customRegex: { regex: regexes.name, message: "can only contain letters" },
  },
  otp: {
    field: "otp",
    label: "OTP",
    min: 6,
    max: 6,
    allowSpace: "noSpace",
    customRegex: { regex: regexes.otp, message: "must be 6 digits" },
  },
};
