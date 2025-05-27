import { z } from "zod";
import { validateZodString } from "../../../utils";
import {
  emailRegex,
  nameRegex,
  passwordRegex,
  phoneRegex,
} from "../../../constants";

export const registerZodSchema = z
  .object({
    firstName: validateZodString({
      field: "firstName",
      blockMultipleSpaces: true,
      min: 2,
      max: 50,
      customRegex: {
        regex: nameRegex,
        message:
          "can only contain letters and only one space is allowed between words.",
      },
    }),
    lastName: validateZodString({
      field: "lastName",
      blockMultipleSpaces: true,
      min: 2,
      max: 50,
      customRegex: {
        regex: nameRegex,
        message:
          "can only contain letters and only one space is allowed between words.",
      },
    }),
    email: validateZodString({
      field: "email",
      blockSingleSpace: true,
      customRegex: {
        regex: emailRegex,
        message:
          "please provide a valid email address, like example@domain.com.",
      },
    }),
    phoneNumber: validateZodString({
      field: "phoneNumber",
      min: 10,
      max: 10,
      customRegex: {
        regex: phoneRegex,
        message:
          "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
      },
    }),
    password: validateZodString({
      field: "password",
      min: 6,
      max: 20,
      customRegex: {
        regex: passwordRegex,
        message:
          "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },
    }),
    confirmPassword: validateZodString({
      field: "confirmPassword",
      min: 6,
      max: 20,
      customRegex: {
        regex: passwordRegex,
        message:
          "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

export const loginZodSchema = z
  .object({
    email: validateZodString({
      field: "email",
      blockSingleSpace: true,
      customRegex: {
        regex: emailRegex,
        message:
          "please provide a valid email address, like 'example@domain.com'",
      },
    }).optional(),
    phoneNumber: validateZodString({
      field: "phoneNumber",
      min: 10,
      max: 10,
      customRegex: {
        regex: phoneRegex,
        message:
          "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
      },
    }).optional(),
    password: validateZodString({
      field: "password",
      min: 6,
      max: 20,
      customRegex: {
        regex: passwordRegex,
        message:
          "must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },
    }),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required.",
    path: [],
  });
