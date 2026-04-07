import { ZodValidator } from "../utils/zod.utils";
import { constants } from "../constants";

const emailZodSchema = ZodValidator.string(constants.zod.stringOptions.EMAIL);
const phoneNumberZodSchema = ZodValidator.string(
  constants.zod.stringOptions.PHONE_NUMBER,
);
const otpZodSchema = ZodValidator.string(constants.zod.stringOptions.OTP);

export const commonZodSchemas = {
  email: emailZodSchema,
  phoneNumber: phoneNumberZodSchema,
  otp: otpZodSchema,
};
