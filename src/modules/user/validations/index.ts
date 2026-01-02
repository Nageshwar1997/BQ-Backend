import z from "zod";
import { validateZodEnums, validateZodString } from "../../../utils";
import {
  ALLOWED_BUSINESSES,
  ALLOWED_COUNTRIES,
  regexes,
  STATES_AND_UNION_TERRITORIES,
} from "../../../constants";

export const sellerRequestZodSchema = z.object({
  businessAddress: z.object(
    {
      address: validateZodString({
        field: "address",
        parentField: "businessAddress",
        blockMultipleSpaces: true,
        min: 3,
      }),
      landmark: validateZodString({
        field: "landmark",
        parentField: "businessAddress",
        blockMultipleSpaces: true,
        min: 2,
        isOptional: true,
        nonEmpty: false,
      }),
      city: validateZodString({
        field: "city",
        parentField: "businessAddress",
        blockMultipleSpaces: true,
        min: 2,
      }),
      state: validateZodEnums({
        field: "state",
        parentField: "businessAddress",
        enums: STATES_AND_UNION_TERRITORIES,
      }),
      country: validateZodEnums({
        field: "country",
        parentField: "businessAddress",
        enums: ALLOWED_COUNTRIES,
      }).default("India"),
      pinCode: validateZodString({
        field: "pinCode",
        parentField: "businessAddress",
        min: 6,
        max: 6,
        blockSingleSpace: true,
        customRegexes: [{ regex: regexes.pinCode, message: "must be valid" }],
      }),
      pan: validateZodString({
        field: "pan",
        parentField: "businessAddress",
        min: 10,
        max: 10,
        blockSingleSpace: true,
        customRegexes: [{ regex: regexes.pan, message: "must be valid" }],
      }),
      gst: validateZodString({
        field: "gst",
        parentField: "businessAddress",
        min: 15,
        max: 16,
        blockSingleSpace: true,
        customRegexes: [{ regex: regexes.gst, message: "must be valid" }],
      }),
    },
    {
      required_error: "businessAddress is required",
      invalid_type_error: "businessAddress must be object",
    }
  ),
  businessDetails: z.object(
    {
      name: validateZodString({
        field: "name",
        parentField: "businessDetails",
        blockMultipleSpaces: true,
        min: 2,
        customRegexes: [
          {
            regex: regexes.name,
            message:
              "can only contain letters and only one space is allowed between words",
          },
        ],
      }),
      email: validateZodString({
        field: "email",
        parentField: "businessDetails",
        blockSingleSpace: true,
        lowerCase: true,
        customRegexes: [
          {
            regex: regexes.email,
            message:
              "please provide a valid email address, like example@domain.com",
          },
        ],
      }),
      phoneNumber: validateZodString({
        field: "phoneNumber",
        parentField: "businessDetails",
        blockSingleSpace: true,
        min: 10,
        max: 10,
        customRegexes: [
          {
            regex: regexes.phoneNumber,
            message:
              "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
          },
        ],
      }),
      category: validateZodEnums({
        field: "category",
        parentField: "businessDetails",
        enums: ALLOWED_BUSINESSES,
      }),
    },
    {
      required_error: "businessDetails is required",
      invalid_type_error: "businessDetails must be object",
    }
  ),
  agreeTerms: z.coerce.boolean({
    required_error: "agreeTerms is required",
    invalid_type_error: "agreeTerms must be boolean",
  }),
});

export const updateUserZodSchema = z.object({
  firstName: validateZodString({
    field: "firstName",
    blockMultipleSpaces: true,
    isOptional: true,
    min: 2,
    max: 50,
    customRegexes: [
      {
        regex: regexes.name,
        message:
          "can only contain letters and only one space is allowed between words",
      },
    ],
  }),
  lastName: validateZodString({
    field: "lastName",
    blockMultipleSpaces: true,
    isOptional: true,
    min: 2,
    max: 50,
    customRegexes: [
      {
        regex: regexes.name,
        message:
          "can only contain letters and only one space is allowed between words",
      },
    ],
  }),
  email: validateZodString({
    field: "email",
    blockSingleSpace: true,
    lowerCase: true,
    isOptional: true,
    customRegexes: [
      {
        regex: regexes.email,
        message:
          "please provide a valid email address, like example@domain.com",
      },
    ],
  }),
  phoneNumber: validateZodString({
    field: "phoneNumber",
    blockSingleSpace: true,
    isOptional: true,
    min: 10,
    max: 10,
    customRegexes: [
      {
        regex: regexes.phoneNumber,
        message:
          "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
      },
    ],
  }),
});

export const updatePasswordZodSchema = z
  .object({
    password: validateZodString({
      min: 6,
      max: 20,
      blockSingleSpace: true,
      field: "password",
      customRegexes: [
        {
          regex: regexes.password,
          message:
            "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ],
    }),
    confirmPassword: validateZodString({
      min: 6,
      max: 20,
      blockSingleSpace: true,
      field: "confirmPassword",
      customRegexes: [
        {
          regex: regexes.password,
          message:
            "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ],
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

export const changePasswordZodSchema = z
  .object({
    oldPassword: validateZodString({
      min: 6,
      max: 20,
      blockSingleSpace: true,
      field: "oldPassword",
      customRegexes: [
        {
          regex: regexes.password,
          message:
            "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ],
    }),
    newPassword: validateZodString({
      min: 6,
      max: 20,
      blockSingleSpace: true,
      field: "newPassword",
      customRegexes: [
        {
          regex: regexes.password,
          message:
            "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ],
    }),
    confirmPassword: validateZodString({
      min: 6,
      max: 20,
      blockSingleSpace: true,
      field: "confirmPassword",
      customRegexes: [
        {
          regex: regexes.password,
          message:
            "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ],
    }),
  })
  .superRefine((data, ctx) => {
    const { oldPassword, newPassword, confirmPassword } = data;

    // Old password & new password must be different
    if (oldPassword === newPassword) {
      ctx.addIssue({
        path: ["newPassword"],
        code: z.ZodIssueCode.custom,
        message: "New password must be different from current password.",
      });
    }

    // New & confirm password must match
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match.",
      });
    }
  });
