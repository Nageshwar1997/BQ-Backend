import { Schema } from "mongoose";
import { IAddress, IUserAddresses } from "../Address.Types";
import { AddressConstants } from "../Address.Constants";
import { Constants } from "../../../Constants";

const AddressBaseFields = {
  address: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: {
    type: String,
    required: true,
    enum: Constants.Common.STATES_AND_UNION_TERRITORIES,
  },
  pinCode: { type: String, required: true, minlength: 6, maxlength: 6 },
  country: {
    type: String,
    required: true,
    enum: Constants.Common.ALLOWED_COUNTRIES,
    default: "India",
  },
  phoneNumber: { type: String, required: true },
  altPhoneNumber: { type: String, default: "" },
  gst: { type: String, default: "" },
  type: {
    type: String,
    required: true,
    enum: AddressConstants.ADDRESS_TYPES,
    default: "both",
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
};

const AddressSchema = new Schema<IAddress>(
  {
    ...AddressBaseFields,
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false },
);

const UserAddressSchema = new Schema<IUserAddresses>(
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

export const AddressSchemas = {
  Address: AddressSchema,
  UserAddress: UserAddressSchema,
  BaseFields: AddressBaseFields,
};
