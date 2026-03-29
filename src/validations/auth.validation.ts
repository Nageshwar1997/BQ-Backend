import { object } from "zod";
import { commonZodSchemas } from "./common.validation";
import { appendZodCustomIssue, ZodValidator } from "../utils/zod.utils";
import { zodStringOptions } from "../constants";

export const registerOtpZodSchema = object({ otp: commonZodSchemas.otp });
export const registerEmailZodSchema = object({ email: commonZodSchemas.email });

export const registerZodSchema = object({
  firstName: ZodValidator.string({
    ...zodStringOptions.name,
    field: "firstName",
    label: "First name",
  }),
  lastName: ZodValidator.string({
    ...zodStringOptions.name,
    field: "lastName",
    label: "Last name",
  }),
  otp: registerOtpZodSchema.shape.otp,
  email: registerEmailZodSchema.shape.email,
  phoneNumber: commonZodSchemas.phoneNumber,
  password: ZodValidator.string(zodStringOptions.password),
  confirmPassword: ZodValidator.string({
    ...zodStringOptions.password,
    field: "confirmPassword",
    label: "Confirm Password",
  }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    appendZodCustomIssue(ctx, "Passwords do not match", "confirmPassword");
  }
});

export const loginZodSchema = object({
  loginMethod: ZodValidator.enum({
    enumValues: ["email", "phoneNumber"],
    field: "loginMethod",
    label: "Login method",
  }),
  email: registerZodSchema.shape.email.optional(),
  phoneNumber: registerZodSchema.shape.phoneNumber.optional(),
})
  .extend(registerZodSchema.pick({ password: true }))
  .superRefine((data, ctx) => {
    if (data.loginMethod === "email" && !data.email) {
      appendZodCustomIssue(ctx, "Email is required", "email");
    }
    if (data.loginMethod === "phoneNumber" && !data.phoneNumber) {
      appendZodCustomIssue(ctx, "Phone number is required", "phoneNumber");
    }
  });
