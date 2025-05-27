import { Types } from "mongoose";
import { z, ZodType } from "zod";

import {
  ValidateRequiredFileFieldsParams,
  ZodDateConfigs,
  ZodNumberConfigs,
  ZodStringConfigs,
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
}: ValidateRequiredFileFieldsParams): void => {
  const requiredFields: string[] = [];

  const singleFile = req.file;
  const multipleFiles = req.files;
  // Helper to check if any file fieldname starts with the expected field
  const hasMatchingField = (
    field: string,
    uploadedFieldNames: string[]
  ): boolean => {
    return uploadedFieldNames.some((uploaded) => uploaded.startsWith(field));
  };
  // Case 1: .single()
  if (singleFile) {
    const uploadedFieldNames = [singleFile.fieldname];
    fields.forEach((field) => {
      if (!hasMatchingField(field, uploadedFieldNames)) {
        requiredFields.push(field);
      }
    });
  }
  // Case 2: .array() or .any()
  else if (Array.isArray(multipleFiles)) {
    const uploadedFieldNames = multipleFiles.map((file) => file.fieldname);
    fields.forEach((field) => {
      if (!hasMatchingField(field, uploadedFieldNames)) {
        requiredFields.push(field);
      }
    });
  }
  // Case 3: .fields() => files is Record<string, File[]>
  else if (multipleFiles && typeof multipleFiles === "object") {
    const fileMap = multipleFiles as Record<string, Express.Multer.File[]>;
    const uploadedFieldNames = Object.keys(fileMap);
    fields.forEach((field) => {
      if (!hasMatchingField(field, uploadedFieldNames)) {
        requiredFields.push(field);
      }
    });
  }
  // Throw error if any required fields are missing
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
}: ZodStringConfigs) => {
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

  let schema = z
    .string({
      required_error: messages.required,
      invalid_type_error: messages.invalid_type,
    })
    .trim();

  if (nonEmpty) {
    schema = schema.nonempty({ message: messages.non_empty });
  }

  if (min !== undefined) {
    schema = schema.min(min, messages.min);
  }

  if (max !== undefined) {
    schema = schema.max(max, messages.max);
  }

  if (blockMultipleSpaces) {
    schema = schema.regex(singleSpaceRegex, messages.multiple_spaces);
  }

  if (blockSingleSpace) {
    schema = schema.regex(noSpaceRegex, messages.single_space);
  }

  if (customRegex && customRegex.regex) {
    schema = schema.regex(customRegex.regex, messages.custom);
  }

  return isOptional ? schema.optional() : schema;
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

  let schema = z.coerce.number({
    required_error: messages.required, // mostly this error will not be thrown because of coerce
    invalid_type_error: messages.invalid_type,
  });

  if (nonNegative) {
    schema = schema.nonnegative({
      message: messages.non_negative,
    });
  }

  if (mustBeInt) {
    schema = schema.int({ message: messages.must_be_int });
  }

  if (min !== undefined) {
    schema = schema.min(min, messages.min);
  }

  if (max !== undefined) {
    schema = schema.max(max, messages.max);
  }

  return isOptional ? schema.optional() : schema;
};

export const validateZodDate = ({
  field,
  parentField,
  isOptional = false,
  mustBePastDate = false,
  mustBeFutureDate = false,
}: ZodDateConfigs): ZodType<Date | undefined> => {
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
