import { Types } from "mongoose";
import { z } from "zod";

import { ZodNumberProps, ZodStringProps } from "../types";
import { noSpaceRegex, singleSpaceRegex } from "../constants";

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

export const validateZodString = ({
  field,
  nonEmpty = false,
  min,
  max,
  blockSingleSpace,
  blockMultipleSpaces,
  parentField,
  customRegex,
}: ZodStringProps) => {
  const nestedField = parentField ? `${parentField}.${field}` : field;

  let schema = z
    .string({
      required_error: `The '${nestedField}' field is required.`,
      invalid_type_error: `The '${nestedField}' field must be a string.`,
    })
    .trim();

  if (nonEmpty) {
    schema = schema.nonempty({
      message: `The '${nestedField}' field cannot be empty.`,
    });
  }

  if (min !== undefined) {
    schema = schema.min(
      min,
      `The '${nestedField}' field must be at least ${min} characters long.`
    );
  }

  if (max !== undefined) {
    schema = schema.max(
      max,
      `'${nestedField}' must not exceed ${max} characters.`
    );
  }

  if (blockMultipleSpaces) {
    schema = schema.regex(
      singleSpaceRegex,
      `The '${nestedField}' field must not contain multiple consecutive spaces.`
    );
  }

  if (blockSingleSpace) {
    schema = schema.regex(
      noSpaceRegex,
      `The '${nestedField}' field must not contain any spaces.`
    );
  }

  if (customRegex) {
    const { regex, message } = customRegex;
    if (regex && message) {
      schema = schema.regex(regex, message);
    }
  }

  return schema;
};

export const validateZodNumber = ({
  field,
  parentField,
  min,
  max,
  mustBeInt = false,
  nonNegative = true,
}: ZodNumberProps) => {
  const nestedField = parentField ? `${parentField}.${field}` : field;

  let schema = z.coerce.number({
    required_error: `The '${nestedField}' field is required.`,
    invalid_type_error: `The '${nestedField}' field must be a number.`,
  });

  if (nonNegative) {
    schema = schema.nonnegative({
      message: `The '${nestedField}' field must be a non-negative number.`,
    });
  }

  if (mustBeInt) {
    schema = schema.int({
      message: `The '${nestedField}' field must be an integer.`,
    });
  }

  if (min !== undefined) {
    schema = schema.min(
      min,
      `The '${nestedField}' field must be at least ${min}.`
    );
  }

  if (max !== undefined) {
    schema = schema.max(
      max,
      `The '${nestedField}' field must not exceed ${max}.`
    );
  }

  return schema;
};
