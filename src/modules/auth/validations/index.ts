import { z } from "zod";
import {
  validateConfirmPassword,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhoneNumber,
} from "../constants";

export const registerZodSchema = z
  .object({
    firstName: validateFirstName,
    lastName: validateLastName,
    email: validateEmail,
    phoneNumber: validatePhoneNumber,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

export const loginZodSchema = z
  .object({
    email: validateEmail.optional(),
    phoneNumber: validatePhoneNumber.optional(),
    password: validatePassword,
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required.",
    path: [],
  });
