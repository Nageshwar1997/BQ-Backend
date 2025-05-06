import { z } from "zod";

const nameRegex = /^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/;
const phoneRegex = /^[6-9][0-9]{9}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/;

export const validateFirstName = z
  .string({
    required_error: "First name is required.",
    invalid_type_error: "First name must be a text value.",
  })
  .regex(
    nameRegex,
    "First name can only contain letters and only one space is allowed between words."
  )
  .min(2, "First name should be at least 2 characters long.")
  .max(50, "First name should not exceed 50 characters.");

export const validateLastName = z
  .string({
    required_error: "Last name is required.",
    invalid_type_error: "Last name must be a text value.",
  })
  .min(2, "Last name should be at least 2 characters long.")
  .max(50, "Last name should not exceed 50 characters.")
  .regex(
    nameRegex,
    "Last name can only contain letters and only one space is allowed between words."
  );

export const validateEmail = z
  .string({
    required_error: "Email address is required.",
    invalid_type_error: "Email address must be string.",
  })
  .email("Please enter a valid email address.");

export const validatePhoneNumber = z
  .string({
    required_error: "Phone number is required.",
    invalid_type_error: "Phone number must be a string.",
  })
  .regex(
    phoneRegex,
    "Phone number must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long."
  );

export const validatePassword = z
  .string({
    required_error: "Password is required.",
    invalid_type_error: "Password must be string.",
  })
  .regex(
    passwordRegex,
    "Password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
  );

export const validateConfirmPassword = z
  .string({
    required_error: "Confirm password is required.",
  })
  .regex(
    passwordRegex,
    "Confirm password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
  );
