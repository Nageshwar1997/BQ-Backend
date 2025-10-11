import { Schema, Types } from "mongoose";
import { IOrder } from "../types";
import { AddressModule, CartProductModule } from "../..";
import { TCartProduct } from "../../cartProduct/types";
import {
  ALLOWED_PAYMENT_MODE,
  ALLOWED_CURRENCIES,
  ORDER_STATUS,
  RAZORPAY_PAYMENT_METHODS,
  RAZORPAY_PAYMENT_STATUS,
} from "../constants";

// Sub-schema for addresses
export const orderAddressSchema = new Schema<
  Omit<AddressModule.Types.IAddress, "user">
>(AddressModule.Schemas.addressBaseFields, { versionKey: false, _id: false });

// Sub-schema for products
export const orderProductSchema = new Schema<Omit<TCartProduct, "cart">>(
  CartProductModule.Schemas.cartProductBaseFields,
  { versionKey: false, timestamps: true, _id: false }
);

// Main order schema
export const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [orderProductSchema],
    addresses: {
      shipping: orderAddressSchema,
      billing: orderAddressSchema,
      both: orderAddressSchema,
    },
    razorpay_payment_result: {
      payment_mode: {
        type: String,
        enum: ALLOWED_PAYMENT_MODE,
        default: "ONLINE",
      },
      rzp_order_id: { type: String },
      rzp_payment_id: { type: String },
      rzp_signature: { type: String },
      payment_method: { type: String, enum: RAZORPAY_PAYMENT_METHODS },
      rzp_payment_status: {
        type: String,
        enum: RAZORPAY_PAYMENT_STATUS,
        default: "UNPAID",
      },
      currency: { type: String, enum: ALLOWED_CURRENCIES, default: "INR" },
    },
    order_result: {
      order_status: { type: String, enum: ORDER_STATUS, default: "PENDING" },
      price: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
      charges: { type: Number, default: 0 },
      paid_at: { type: Date },
      delivered_at: { type: Date },
      cancelled_at: { type: Date },
      returned_at: { type: Date },
      order_receipt: { type: String },
    },
  },
  { timestamps: true, versionKey: false }
);
