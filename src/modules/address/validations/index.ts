import { z } from "zod";
import { validateZodString } from "../../../utils";
import { regexes } from "../../../constants";
import { ADDRESS_TYPES, ALLOWED_COUNTRIES } from "../constants";

export const addAddressSchema = z.object({
  address: validateZodString({
    field: "address",
    blockMultipleSpaces: true,
    min: 3,
  }),
  landmark: validateZodString({
    field: "landmark",
    blockMultipleSpaces: true,
    min: 2,
    isOptional: true,
    nonEmpty: false,
  }),
  city: validateZodString({
    field: "city",
    blockMultipleSpaces: true,
    min: 2,
  }),
  gst: validateZodString({
    field: "gst",
    blockSingleSpace: true,
    min: 15,
    max: 15,
    customRegex: {
      regex: regexes.validGST,
      message: "Please provide a valid GST number",
    },
    isOptional: true,
    nonEmpty: false,
  }),
  pinCode: validateZodString({
    field: "pinCode",
    min: 6,
    max: 6,
    blockSingleSpace: true,
    customRegex: {
      regex: regexes.validPinCode,
      message: "Please provide a valid Pin Code",
    },
  }),
  state: validateZodString({
    field: "state",
    blockMultipleSpaces: true,
    min: 2,
  }),
  country: z
    .enum(ALLOWED_COUNTRIES, {
      errorMap: () => ({
        message: `Invalid country. Must be '${ALLOWED_COUNTRIES.join("'/'")}'.`,
      }),
    })
    .default("India"),
  type: z
    .enum(ADDRESS_TYPES, {
      errorMap: () => ({
        message: `Invalid address type. Must be '${ADDRESS_TYPES.join(
          "'/'"
        )}'.`,
      }),
    })
    .default("both"),
  firstName: validateZodString({
    field: "firstName",
    blockMultipleSpaces: true,
    min: 2,
    max: 50,
    customRegex: {
      regex: regexes.validName,
      message:
        "can only contain letters and only one space is allowed between words",
    },
  }),
  lastName: validateZodString({
    field: "lastName",
    blockMultipleSpaces: true,
    min: 2,
    max: 50,
    customRegex: {
      regex: regexes.validName,
      message:
        "can only contain letters and only one space is allowed between words",
    },
  }),
  email: validateZodString({
    field: "email",
    blockSingleSpace: true,
    customRegex: {
      regex: regexes.validEmail,
      message: "please provide a valid email address, like example@domain.com",
    },
  }),
  phoneNumber: validateZodString({
    field: "phoneNumber",
    blockSingleSpace: true,
    min: 10,
    max: 10,
    customRegex: {
      regex: regexes.validPhone,
      message:
        "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
    },
  }),
  altPhoneNumber: validateZodString({
    field: "altPhoneNumber",
    isOptional: true,
    blockSingleSpace: true,
    nonEmpty: false,
    min: 10,
    max: 10,
    customRegex: {
      regex: regexes.validPhone,
      message:
        "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
    },
  }),
  isDefaultAddress: z.coerce
    .boolean({
      errorMap: () => ({
        message: "isDefaultAddress must be a boolean",
      }),
    })
    .default(false)
    .optional(),
});
