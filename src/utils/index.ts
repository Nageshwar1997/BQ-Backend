import { Types } from "mongoose";
import { z } from "zod";

import { ZodStringProps } from "../types";
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
}: ZodStringProps) => {
  const nestedField = parentField ? `${parentField}.${field}` : field;

  if (parentField) {
    console.log("nestedField", nestedField);
  }
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

  if (min) {
    schema = schema.min(
      min,
      `The '${nestedField}' field must be at least ${min} characters long.`
    );
  }

  if (max) {
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

  return schema;
};
