import { Schema } from "mongoose";
import { constants } from "../../constants";
import { IAddress, IUserAddresses } from "./types";

const addressBaseFields = {
  address: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: {
    type: String,
    required: true,
    enum: constants.common.STATES_AND_UNION_TERRITORIES,
  },
  pinCode: { type: String, required: true, minlength: 6, maxlength: 6 },
  country: {
    type: String,
    required: true,
    enum: constants.common.ALLOWED_COUNTRIES,
    default: "India",
  },
  phoneNumber: { type: String, required: true },
  altPhoneNumber: { type: String, default: "" },
  gst: { type: String, default: "" },
  type: {
    type: String,
    required: true,
    enum: constants.common.ADDRESS_TYPES,
    default: "both",
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
};

const addressSchema = new Schema<IAddress>(
  {
    ...addressBaseFields,
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false },
);

const userAddressSchema = new Schema<IUserAddresses>(
  {
    addresses: {
      type: [{ type: Schema.Types.ObjectId, ref: "Address" }],
      default: [],
      validate: {
        validator: function (addresses) {
          return addresses.length <= 5; // You can add max 5 addresses
        },
        message:
          "You can add max 5 addresses only. Remove some addresses to add more.",
      },
    },
    defaultAddress: { type: Schema.Types.ObjectId, ref: "Address" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false },
);

export const addressSchemas = {
  address: addressSchema,
  userAddress: userAddressSchema,
  baseFields: addressBaseFields,
};
