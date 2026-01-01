import { z } from "zod";
import { validateZodEnums, validateZodString } from "../../../utils";
import { ALLOWED_COUNTRIES, regexes } from "../../../constants";
import { ADDRESS_TYPES } from "../constants";

const addressBaseSchema = z.object({
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
    customRegexes: [{ regex: regexes.gst, message: "must be valid" }],
    isOptional: true,
    nonEmpty: false,
  }),
  pinCode: validateZodString({
    field: "pinCode",
    min: 6,
    max: 6,
    blockSingleSpace: true,
    customRegexes: [{ regex: regexes.pinCode, message: "must be valid" }],
  }),
  state: validateZodString({
    field: "state",
    blockMultipleSpaces: true,
    min: 2,
  }),
  country: validateZodEnums({
    field: "country",
    enums: ALLOWED_COUNTRIES,
  }).default("India"),
  type: validateZodEnums({
    field: "type",
    enums: ADDRESS_TYPES,
  }).default("both"),
  firstName: validateZodString({
    field: "firstName",
    blockMultipleSpaces: true,
    min: 2,
    max: 50,
    customRegexes: [
      {
        regex: regexes.name,
        message:
          "can only contain letters and only one space is allowed between words",
      },
    ],
  }),
  lastName: validateZodString({
    field: "lastName",
    blockMultipleSpaces: true,
    min: 2,
    max: 50,
    customRegexes: [
      {
        regex: regexes.name,
        message:
          "can only contain letters and only one space is allowed between words",
      },
    ],
  }),
  email: validateZodString({
    field: "email",
    blockSingleSpace: true,
    lowerCase: true,
    customRegexes: [
      {
        regex: regexes.email,
        message:
          "please provide a valid email address, like example@domain.com",
      },
    ],
  }),
  phoneNumber: validateZodString({
    field: "phoneNumber",
    blockSingleSpace: true,
    min: 10,
    max: 10,
    customRegexes: [
      {
        regex: regexes.phoneNumber,
        message:
          "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
      },
    ],
  }),
  altPhoneNumber: validateZodString({
    field: "altPhoneNumber",
    isOptional: true,
    blockSingleSpace: true,
    nonEmpty: false,
    min: 10,
    max: 10,
    customRegexes: [
      {
        regex: regexes.phoneNumber,
        message:
          "must be a valid Indian number starting with 6, 7, 8, or 9 and be exactly 10 digits long.",
      },
    ],
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

const phoneValidation = (
  data: Partial<z.infer<typeof addressBaseSchema>>,
  ctx: z.RefinementCtx
) => {
  if (data.altPhoneNumber && data.phoneNumber === data.altPhoneNumber) {
    ctx.addIssue({
      code: "custom",
      message: "Alternate phone number cannot be the same as phone number",
      path: ["altPhoneNumber"],
    });
  }
};

export const addAddressSchema = addressBaseSchema.superRefine(phoneValidation);

export const updateAddressSchema = addressBaseSchema
  .extend({
    removedOptionalFields: z.array(
      validateZodEnums({
        field: "[some_index]",
        parentField: "removedOptionalFields",
        enums: ["altPhoneNumber", "gst", "landmark"],
      })
    ),
  })
  .partial()
  .superRefine(phoneValidation);
