import Joi from "joi";
import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhoneNumber,
} from "../constants";

export const registerJoiSchema = Joi.object({
  firstName: validateFirstName,
  lastName: validateLastName,
  email: validateEmail,
  phoneNumber: validatePhoneNumber,
  password: validatePassword,
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords don't match.",
  }),
});

export const loginJoiSchema = Joi.object({
  email: validateEmail.optional(),
  phoneNumber: validatePhoneNumber.optional(),
  password: validatePassword,
})
  .or("email", "phoneNumber") // Ensures at least one is present
  .messages({
    "object.missing": "Either email or phone number is required.",
  });
