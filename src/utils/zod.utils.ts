import { string } from "zod";

type TZodCommonBaseConfigs = {
  field: string;
  parentField?: string;
  label: string;
  parentLabel?: string;
};

export type TZodCompareConfigs = { min?: number; max?: number };
export type TZodRegex = { regex: RegExp; message: string };

export interface IZodStringConfigs
  extends TZodCommonBaseConfigs, TZodCompareConfigs {
  allowSpace?: boolean;
  nonEmpty?: boolean;
  customRegexes?: TZodRegex[];
  lowerOrUpper?: "upper" | "lower";
}

export type TRegexes =
  | "noSpace"
  | "singleSpace"
  | "hexCode"
  | "date"
  | "name"
  | "password"
  | "email"
  | "otp"
  | "pin_code"
  | "gst"
  | "url"
  | "phone"
  | "phoneStart"
  | "phoneExactLength"
  | "onlyDigits"
  | "onlyLetters"
  | "onlyUppercase"
  | "onlyLowercase"
  | "atLeastOneDigit"
  | "onlyLettersAndSpaces"
  | "atLeastOneLowercaseLetter"
  | "atLeastOneSpecialCharacter"
  | "atLeastOneUppercaseLetter"
  | "only_letters_and_spaces_and_dots"
  | "pan";

export const regexes: Record<TRegexes, RegExp> = {
  noSpace: /^\S+$/, // No spaces allowed
  singleSpace: /^(?!.* {2,}).*$/s, // Single space allowed
  hexCode: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, // Hex color code
  date: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|([+-]\d{2}:\d{2}))?)?$/, // Date e.g. 2022-01-01T12:00:00Z
  name: /^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/, // Only letters & single space
  password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/, // Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long
  email:
    /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/, // Email e.g. 3oYQK@example.com
  phoneStart: /^[6-9]/, // Starts with 6, 7, 8, or 9
  phoneExactLength: /^\d{10}$/, // Exactly 10 digits
  phone: /^[6-9][0-9]{9}$/, // Phone number e.g. 9876543210
  atLeastOneUppercaseLetter: /[A-Z]/, // At least one uppercase letter
  atLeastOneLowercaseLetter: /[a-z]/, // At least one lowercase letter
  atLeastOneDigit: /\d/, // At least one digit
  atLeastOneSpecialCharacter: /[@$!%*?&#]/, // At least one special character
  onlyDigits: /^\d+$/, // All characters are digits
  onlyUppercase: /^[A-Z]+$/, // All characters are uppercase
  onlyLowercase: /^[a-z]+$/, // All characters are lowercase
  onlyLetters: /^[a-zA-Z]+$/, // All characters are letters
  onlyLettersAndSpaces: /^[a-zA-Z\s]+$/, // All characters are letters and spaces
  only_letters_and_spaces_and_dots: /^[a-zA-Z\s.]+$/, // Only letters, spaces, and dots
  pin_code: /^[1-9][0-9]{5}$/, // Check valid pin code
  otp: /^[0-9]{6}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, // Check valid GST number
  url: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i,
  pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
};

export const zodString = ({
  field,
  label,
  nonEmpty = true,
  min,
  max,
  allowSpace = true,
  parentField,
  parentLabel,
  customRegexes,
  lowerOrUpper,
}: IZodStringConfigs) => {
  const baseName = label ?? field;
  const parentName = parentLabel ?? parentField;

  const name = parentName ? `${parentName}: ${baseName}` : baseName;

  const messages = {
    required: `${name} is required.`,
    invalid_type: `${name} must be a string.`,
    non_empty: `${name} cannot be empty.`,
    min: `${name} must be at least ${min} characters.`,
    max: `${name} must not exceed ${max} characters.`,
    multiple_spaces: `${name} must not contain multiple consecutive spaces.`,
    single_space: `${name} must not contain any spaces.`,
    custom: `${name}`,
  };

  let schema = string(messages.required)
    .trim()
    .refine((val) => typeof val === "string", {
      message: messages.invalid_type,
    });

  if (nonEmpty) {
    schema = schema.nonempty({ message: messages.required });
  }

  if (nonEmpty && min !== undefined) {
    schema = schema.min(min, messages.min);
  }

  if (nonEmpty && max !== undefined) {
    schema = schema.max(max, messages.max);
  }

  if (allowSpace === true) {
    schema = schema.regex(regexes.singleSpace, messages.multiple_spaces);
  } else if (allowSpace === false) {
    schema = schema.regex(regexes.noSpace, messages.single_space);
  }

  if (lowerOrUpper === "lower") {
    schema = schema.toLowerCase();
  } else if (lowerOrUpper === "upper") {
    schema = schema.toUpperCase();
  }

  if (customRegexes?.length) {
    customRegexes.forEach(({ regex, message }) => {
      schema = schema.regex(regex, `${messages.custom} ${message}.`);
    });
  }

  return schema;
};

export const passwordValidationOptions: IZodStringConfigs = {
  field: "password",
  label: "Password",
  allowSpace: false,
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
        "must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  ],
};

export const phoneValidationOptions: IZodStringConfigs = {
  field: "phoneNumber",
  label: "Phone number",
  allowSpace: false,
  customRegexes: [
    { regex: regexes.phoneStart, message: "must be start with 6, 7, 8, or 9" },
    { regex: regexes.phoneExactLength, message: "must be exactly 10 digits" },
    {
      regex: regexes.phone,
      message: "must be exactly 10 digits and must start with 6, 7, 8, or 9",
    },
  ],
};

export const emailValidationOptions: IZodStringConfigs = {
  allowSpace: false,
  field: "email",
  label: "Email",
  lowerOrUpper: "lower",
  customRegexes: [{ regex: regexes.email, message: "must be valid" }],
};

export const nameValidationOptions: IZodStringConfigs = {
  field: "name",
  label: "Name",
  min: 2,
  max: 50,
  customRegexes: [
    {
      regex: regexes.name,
      message:
        "can only contain letters and only one space is allowed between words",
    },
  ],
};