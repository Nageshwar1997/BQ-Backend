import { Types } from "mongoose";
import { z, ZodType } from "zod";
import { ParsedQs } from "qs";

import {
  ValidateRequiredFileFieldsParams,
  CheckUserPermission,
  ZodDateConfigs,
  ZodNumberConfigs,
  ZodStringConfigs,
  ZodCommonConfigs,
} from "../types";
import { AppError } from "../classes";
import { regexes } from "../constants";

export const isValidMongoId = (
  id: string,
  message: string,
  statusCode?: number
): boolean => {
  const isValid = Types.ObjectId.isValid(id);

  if (!isValid) {
    console.log(`Invalid ObjectId, ${message} : `, id);
    throw new AppError(message, statusCode || 400);
  }

  return true;
};

export const getCloudinaryOptimizedUrl = (url: string): string => {
  if (!url) return "";

  // Check if URL already has f_auto,q_auto
  if (url?.includes("f_auto") || url?.includes("q_auto")) {
    return url; // Already optimized
  }

  // Insert f_auto,q_auto after /upload/
  return url?.replace("/upload/", "/upload/f_auto,q_auto/");
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

export const checkUserPermission = ({
  userId,
  checkId,
  message = "Unauthorized.",
  statusCode = 403,
}: CheckUserPermission) => {
  if (userId.toString() !== checkId.toString()) {
    throw new AppError(message, statusCode);
  }
  return true;
};

export const validateZodString = ({
  field,
  nonEmpty = true,
  min,
  max,
  blockSingleSpace,
  blockMultipleSpaces,
  parentField,
  customRegexes,
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
    custom: (msg: string | number) =>
      msg
        ? `The '${nestedField}' field ${msg}.`
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

  if (nonEmpty && min !== undefined) {
    schema = schema.min(min, messages.min);
  }

  if (nonEmpty && max !== undefined) {
    schema = schema.max(max, messages.max);
  }

  if (blockMultipleSpaces) {
    schema = schema.regex(regexes.singleSpace, messages.multiple_spaces);
  }

  if (blockSingleSpace) {
    schema = schema.regex(regexes.noSpace, messages.single_space);
  }

  if (customRegexes?.length) {
    customRegexes.forEach(({ regex, message }) => {
      schema = schema.regex(regex, `${messages.custom(message)}`);
    });
  }

  return isOptional ? schema.optional() : schema;
};

export const validateZodUrl = ({ ...props }: ZodCommonConfigs) => {
  return validateZodString({
    ...props,
    blockSingleSpace: true,
    customRegexes: [{ regex: regexes.url, message: "must be a valid URL" }],
  });
};

export const validateZodEnums = (
  props: ZodCommonConfigs & { enums: string[] }
) => {
  const { field, parentField, enums, isOptional } = props;

  const nestedField = parentField
    ? `${parentField}${parentField.includes("[") ? " " : "."}${field}`
    : field;

  const baseEnum = z.enum([enums[0], ...enums.slice(1)], {
    errorMap: () => ({
      message: `Invalid option of ${nestedField}. Must be '${enums.join(
        ", "
      )}'.`,
    }),
  });

  return isOptional ? baseEnum.optional() : baseEnum;
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
    .refine((val) => regexes.date.test(val), {
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

export const escapeRegexSpecialChars = (value: string): string => {
  return value.replace(regexes.escapeSpecialChars, "\\$&");
};

export const toArray = (value?: string | ParsedQs | (string | ParsedQs)[]) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((v) => v.trim());
  return [];
};

export const getOtpHtmlMessage = (title: string, otp: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Helvetica', Arial, sans-serif; background-color:#f4f4f7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="400" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.1); padding: 30px; text-align:center;">
              <tr>
                <td>
                  <h1 style="color:#333333;">${title}</h1>
                  <p style="color:#555555; font-size:16px;">Use the following OTP to complete your verification process.</p>
                  <h2 style="color:#111111; font-size:28px; margin:20px 0;"><b>${otp}</b></h2>
                  <p style="color:#777777; font-size:14px;">It will expire in <b>10 minutes</b>.</p>
                  <hr style="border:none; border-top:1px solid #eeeeee; margin:20px 0;">
                  <p style="color:#999999; font-size:12px;">If you did not request this OTP, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
