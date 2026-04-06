import {
  enum as z_enum,
  number,
  string,
  ZodNumber,
  ZodString,
  ZodEnum,
  RefinementCtx,
} from "zod";
import {
  IZodEnumsConfigs,
  IZodNumberConfigs,
  IZodStringConfigs,
} from "../types";
import { regexes } from "../Constants";

export const appendZodCustomIssue = (
  ctx: RefinementCtx,
  message: string,
  fieldPath?: string | number,
) => {
  const path = fieldPath !== undefined ? [fieldPath] : [];
  return ctx.addIssue({ path, code: "custom", message });
};

export const passwordValidationOptions: IZodStringConfigs = {
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
        "must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  ],
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

export const ValidateString = (props: IZodStringConfigs): ZodString => {
  let schema = string().trim();

  const {
    field,
    label,
    allowSpace = "singleSpace",
    customRegexes,
    customRegex,
    lowerOrUpper,
    max,
    min,
    nonEmpty = true,
    parentField,
    parentLabel,
  } = props;

  const baseName = label ?? field;
  const parentName = parentLabel ?? parentField;
  const name = parentName ? `${parentName}: ${baseName}` : baseName;

  if (nonEmpty) {
    schema = schema.nonempty({ message: `${name} is required.` });

    if (min !== undefined) {
      schema = schema.min(min, `${name} must be at least ${min} characters.`);
    }

    if (max !== undefined) {
      schema = schema.max(max, `${name} must not exceed ${max} characters.`);
    }
  }

  if (allowSpace === "singleSpace") {
    schema = schema.regex(
      regexes.singleSpace,
      `${name} must not contain multiple spaces.`,
    );
  } else if (allowSpace === "noSpace") {
    schema = schema.regex(regexes.noSpace, `${name} must not contain spaces.`);
  }

  if (customRegexes?.length) {
    customRegexes.forEach(({ regex, message }) => {
      schema = schema.regex(regex, `${name} ${message}.`);
    });
  }

  if (customRegex) {
    schema = schema.regex(customRegex.regex, `${name} ${customRegex.message}.`);
  }

  if (lowerOrUpper === "lower") {
    schema = schema.toLowerCase();
  } else if (lowerOrUpper === "upper") {
    schema = schema.toUpperCase();
  }

  return schema;
};

export const ValidateNumber = (props: IZodNumberConfigs): ZodNumber => {
  let schema = number();

  const {
    field,
    label,
    min,
    max,
    parentField,
    parentLabel,
    isInt = false,
    isPositive = true,
    isNegative = false,
  } = props;

  const baseName = label ?? field;
  const parentName = parentLabel ?? parentField;
  const name = parentName ? `${parentName}: ${baseName}` : baseName;

  if (min !== undefined) {
    schema = schema.min(min, `${name} must be at least ${min}.`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `${name} must not exceed ${max}.`);
  }

  if (isInt) {
    schema = schema.int(`${name} must be an integer.`);
  }

  if (isPositive) {
    schema = schema.positive(`${name} must be a positive number.`);
  }

  if (isNegative) {
    schema = schema.negative(`${name} must be a negative number.`);
  }

  return schema;
};

export const validateEnum = ({
  enumValues,
  field,
  label,
  parentField,
  parentLabel,
}: IZodEnumsConfigs): ZodEnum => {
  const baseName = label ?? field;
  const parentName = parentLabel ?? parentField;

  const name = parentName ? `${parentName}: ${baseName}` : baseName;

  return z_enum(enumValues, {
    error: `${name} is required. Must be one of: ${enumValues.join(", ")}.`,
  });
};

export const ZodValidator = {
  string: ValidateString,
  number: ValidateNumber,
  enum: validateEnum,
};
