import { Schema } from "mongoose";
import { IAddress } from "../types";
import { ALLOWED_COUNTRIES } from "../constants";

export const addressSchema = new Schema<IAddress>(
  {
    address: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    country: { type: String, required: true, enum: ALLOWED_COUNTRIES },
    phoneNumber: { type: String, required: true },
    altPhoneNumber: { type: String },
  },
  { timestamps: true, versionKey: false }
);
