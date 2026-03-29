import { ZodValidator } from "../utils/zod.utils";
import { zodStringOptions } from "../constants";

const emailZodSchema = ZodValidator.string(zodStringOptions.email);
const phoneNumberZodSchema = ZodValidator.string(zodStringOptions.phoneNumber);
const otpZodSchema = ZodValidator.string(zodStringOptions.otp);

export const commonZodSchemas = {
  email: emailZodSchema,
  phoneNumber: phoneNumberZodSchema,
  otp: otpZodSchema,
};
