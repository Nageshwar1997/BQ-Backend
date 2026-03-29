import {
  loginZodSchema,
  registerEmailZodSchema,
  registerOtpZodSchema,
  registerZodSchema,
} from "./auth.validation";
import { commonZodSchemas } from "./common.validation";

export const zodSchemas = {
  common: commonZodSchemas,
  auth: {
    register: {
      otp: registerOtpZodSchema,
      email: registerEmailZodSchema,
      verify: registerZodSchema,
    },
    login: loginZodSchema,
  },
};
