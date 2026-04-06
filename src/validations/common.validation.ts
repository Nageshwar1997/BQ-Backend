import { ZodValidator } from "../utils/zod.utils";
import { Constants } from "../Constants";

const emailZodSchema = ZodValidator.string(Constants.Zod.StringOptions.email);
const phoneNumberZodSchema = ZodValidator.string(
  Constants.Zod.StringOptions.phoneNumber,
);
const otpZodSchema = ZodValidator.string(Constants.Zod.StringOptions.otp);

export const commonZodSchemas = {
  email: emailZodSchema,
  phoneNumber: phoneNumberZodSchema,
  otp: otpZodSchema,
};
