import { Types } from "mongoose";
import { z, ZodType } from "zod";

import {
  ValidateRequiredFileFieldsParams,
  ZodDateProps,
  ZodNumberConfigs,
  ZodStringProps,
} from "../types";
import { dateRegex, noSpaceRegex, singleSpaceRegex } from "../constants";
import { AppError } from "../classes";

export const isValidMongoId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

export const getCloudinaryOptimizedUrl = (url: string): string => {
  if (!url) return "";

  // Check if URL already has f_auto,q_auto
  if (url.includes("f_auto") || url.includes("q_auto")) {
    return url; // Already optimized
  }

  // Insert f_auto,q_auto after /upload/
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

export const convertToISTDate = (date: Date): Date => {
  const utcTime = date.getTime();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  return new Date(utcTime + IST_OFFSET);
};

export const validateRequiredFileFields = ({
  req,
  fields,
  checkIn,
}: ValidateRequiredFileFieldsParams): void => {
  const requiredFields: string[] = [];

  if (checkIn === "file") {
    if (!req.file) {
      requiredFields.push(...fields);
    }
  } else {
    const files = req.files as Express.Multer.File[];

    if (!Array.isArray(files)) {
      requiredFields.push(...fields);
    } else {
      fields.forEach((expectedField) => {
        const exists = files.some((file) =>
          file.fieldname.startsWith(expectedField)
        );
        if (!exists) {
          requiredFields.push(expectedField);
        }
      });
    }
  }

  if (requiredFields.length > 0) {
    throw new AppError(
      `Required file field${
        requiredFields.length > 1 ? "s" : ""
      }: ${requiredFields.join(", ")}`,
      400
    );
  }
};

export const validateZodString = ({
  field,
  nonEmpty = true,
  min,
  max,
  blockSingleSpace,
  blockMultipleSpaces,
  parentField,
  customRegex,
  isOptional = false,
}: ZodStringProps) => {
  const nestedField = parentField
    ? `${parentField}${parentField.includes("[") ? " " : "."}${field}`
    : field;

  const messages = {
    required: `The '${nestedField}' field is required.`,
    invalid_type: `The '${nestedField}' field must be a string.`,
    non_empty: `The '${nestedField}' field cannot be empty.`,
    min: `The '${nestedField}' field must be at least ${min} characters.`,
    max: `The '${nestedField}' field must not exceed ${max} characters.`,
    multiple_spaces: `The '${nestedField}' field must not contain multiple consecutive spaces.`,
    single_space: `The '${nestedField}' field must not contain any spaces.`,
    custom: customRegex?.message
      ? `The '${nestedField}' field ${customRegex?.message}.`
      : `The '${nestedField}' field does not match the required format.`,
  };

  let requiredSchema = z
    .string({
      required_error: messages.required,
      invalid_type_error: messages.invalid_type,
    })
    .trim();

  if (nonEmpty) {
    requiredSchema = requiredSchema.nonempty({ message: messages.non_empty });
  }

  if (min !== undefined) {
    requiredSchema = requiredSchema.min(min, messages.min);
  }

  if (max !== undefined) {
    requiredSchema = requiredSchema.max(max, messages.max);
  }

  if (blockMultipleSpaces) {
    requiredSchema = requiredSchema.regex(
      singleSpaceRegex,
      messages.multiple_spaces
    );
  }

  if (blockSingleSpace) {
    requiredSchema = requiredSchema.regex(noSpaceRegex, messages.single_space);
  }

  if (customRegex && customRegex.regex) {
    requiredSchema = requiredSchema.regex(customRegex.regex, messages.custom);
  }

  const optionalSchema = z
    .string()
    .trim()
    .default("")
    .optional()
    .superRefine((val, ctx) => {
      if (val) {
        if (typeof val !== "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_type,
            expected: "string",
            received: typeof val,
            path: ctx.path,
            message: messages.invalid_type,
          });
          return;
        }

        if (min !== undefined && val.length < min && val !== "") {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            type: "string",
            minimum: min,
            path: ctx.path,
            inclusive: true,
            message: messages.min,
          });
        }

        if (max !== undefined && val.length > max) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            type: "string",
            maximum: max,
            path: ctx.path,
            inclusive: true,
            message: messages.max,
          });
        }

        if (blockMultipleSpaces && singleSpaceRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ctx.path,
            message: messages.multiple_spaces,
          });
        }

        if (blockSingleSpace && noSpaceRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ctx.path,
            message: messages.single_space,
          });
        }

        if (customRegex && customRegex?.regex && !customRegex.regex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ctx.path,
            message: messages.custom,
          });
        }
      }
    });

  return isOptional ? optionalSchema : requiredSchema;
};

export const validateZodNumber = ({
  field,
  parentField,
  min,
  max,
  mustBeInt = false,
  nonNegative = true,
  isOptional = false,
}: ZodNumberConfigs) => {
  const nestedField = parentField
    ? `${parentField}${parentField.includes("[") ? " " : "."}${field}`
    : field;

  const messages = {
    required: `The '${nestedField}' field is required.`,
    invalid_type: `The '${nestedField}' field is required and should be a number.`,
    non_negative: `The '${nestedField}' field must be a non-negative number.`,
    must_be_int: `The '${nestedField}' field must be an integer.`,
    min: `The '${nestedField}' field must be at least ${min}.`,
    max: `The '${nestedField}' field must not exceed ${max}.`,
  };

  let requiredSchema = z.coerce.number({
    required_error: messages.required, // mostly this error will not be thrown because of coerce
    invalid_type_error: messages.invalid_type,
  });

  if (nonNegative) {
    requiredSchema = requiredSchema.nonnegative({
      message: messages.non_negative,
    });
  }

  if (mustBeInt) {
    requiredSchema = requiredSchema.int({ message: messages.must_be_int });
  }

  if (min !== undefined) {
    requiredSchema = requiredSchema.min(min, messages.min);
  }

  if (max !== undefined) {
    requiredSchema = requiredSchema.max(max, messages.max);
  }

  const optionalSchema = z.coerce
    .number()
    .optional()
    .default(0)
    .superRefine((val, ctx) => {
      if (val) {
        if (typeof val !== "number" || isNaN(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_type,
            expected: "number",
            received: typeof val,
            path: ctx.path,
            message: messages.invalid_type,
          });
          return;
        }

        if (nonNegative && val < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ctx.path,
            message: messages.non_negative,
          });
        }

        if (mustBeInt && !Number.isInteger(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ctx.path,
            message: messages.must_be_int,
          });
        }

        if (min !== undefined && val < min) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            type: "number",
            minimum: min,
            path: ctx.path,
            inclusive: true,
            message: messages.min,
          });
        }

        if (max !== undefined && val > max) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            type: "number",
            maximum: max,
            path: ctx.path,
            inclusive: true,
            message: messages.max,
          });
        }
      }
    });

  return isOptional ? optionalSchema : requiredSchema;
};

export const validateZodDate = ({
  field,
  parentField,
  isOptional = false,
  mustBePastDate = false,
  mustBeFutureDate = false,
}: ZodDateProps): ZodType<Date | undefined> => {
  const nestedField = parentField
    ? `${parentField}${parentField.includes("[") ? " " : "."}${field}`
    : field;

  const messages = {
    required: `The '${nestedField}' field is required.`,
    invalid_format: `The '${nestedField}' field must be in 'YYYY-MM-DD' or ISO format.`,
    invalid_date: `The '${nestedField}' field is not a valid date.`,
    past: `The '${nestedField}' field must be in the past.`,
    future: `The '${nestedField}' field must be in the future.`,
  };

  const baseSchema = z
    .string({
      required_error: messages.required,
      invalid_type_error: messages.invalid_format,
    })
    .refine((val) => dateRegex.test(val), {
      message: messages.invalid_format,
    })
    .transform((val) => {
      const hasTime = val.includes("T");
      const date = new Date(val);
      if (hasTime) {
        const utcTime = date.getTime();
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        return new Date(utcTime + IST_OFFSET);
      } else {
        return date;
      }
    })

    .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
      message: messages.invalid_date,
    });

  const refinedSchema = baseSchema.refine(
    (val) => {
      if (!(val instanceof Date)) return false;

      const nowIST = convertToISTDate(new Date());

      if (mustBePastDate && val > nowIST) return false;
      if (mustBeFutureDate && val <= nowIST) return false;
      return true;
    },
    {
      message: mustBePastDate ? messages.past : messages.future,
    }
  );

  return (isOptional
    ? refinedSchema.optional()
    : refinedSchema.refine((val) => val !== undefined, {
        message: messages.required,
      })) as unknown as ZodType<Date | undefined>;
};
