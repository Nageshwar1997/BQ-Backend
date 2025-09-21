import { Schema } from "mongoose";
import { IAddress, IUserAddresses } from "../types";
import { ADDRESS_TYPES, ALLOWED_COUNTRIES } from "../constants";

export const addressSchema = new Schema<IAddress>(
  {
    address: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true, minlength: 6, maxlength: 6 },
    country: {
      type: String,
      required: true,
      enum: ALLOWED_COUNTRIES,
      default: "India",
    },
    phoneNumber: { type: String, required: true },
    altPhoneNumber: { type: String, default: "" },
    gst: { type: String, default: "" },
    type: {
      type: String,
      required: true,
      enum: ADDRESS_TYPES,
      default: "both",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

export const userAddressesSchema = new Schema<IUserAddresses>(
  {
    addresses: { type: [{ type: Schema.Types.ObjectId, ref: "Address" }] },
    defaultAddress: { type: Schema.Types.ObjectId, ref: "Address" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);
