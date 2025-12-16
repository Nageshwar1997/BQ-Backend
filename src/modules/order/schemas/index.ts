import { Schema } from "mongoose";
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

// Nested schemas for payment_details
const upiSchema = new Schema(
  {
    acquirer_data: {
      rrn: { type: String },
      upi_transaction_id: { type: String },
      vpa: { type: String },
      flow: { type: String },
    },
  },
  { _id: false }
);

const netbankingSchema = new Schema(
  {
    acquirer_data: { bank_transaction_id: { type: String } },
  },
  { _id: false }
);

const cardSchema = new Schema(
  {
    id: { type: String },
    name: { type: String },
    last4: { type: String },
    network: { type: String },
    type: { type: String },
    issuer: { type: String },
  },
  { _id: false }
);

const cardDetailSchema = new Schema(
  {
    token_id: { type: String },
    acquirer_data: { auth_code: { type: String } },
    card: cardSchema,
  },
  { _id: false }
);

// Main order schema
export const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [orderProductSchema],
    message: { type: String },
    addresses: {
      shipping: orderAddressSchema,
      billing: orderAddressSchema,
      both: orderAddressSchema,
    },
    payment: {
      mode: { type: String, enum: ALLOWED_PAYMENT_MODE, default: "ONLINE" },
      currency: { type: String, enum: ALLOWED_CURRENCIES, default: "INR" },
      status: {
        type: String,
        enum: RAZORPAY_PAYMENT_STATUS,
        default: "UNPAID",
      },
      razorpay: {
        order_id: { type: String },
        payment_id: { type: String },
        signature: { type: String },
        receipt: { type: String, unique: true },
      },
      amount: { type: Number, required: true, default: 0 },
      paid_at: { type: Date },
      receipt: { type: String, unique: true },
      details: {
        email: { type: String },
        contact: { type: String },
        method: { type: String, enum: RAZORPAY_PAYMENT_METHODS },
        fee: { type: Number },
        tax: { type: Number },
      },
    },
    discount: { type: Number, required: true, default: 0 },
    charges: { type: Number, default: 0 },
    status: { type: String, enum: ORDER_STATUS, default: "PENDING" },
    delivered_at: { type: Date },
    cancelled_at: { type: Date },
    returned_at: { type: Date },

    payment_details: {
      refund_status: { type: String },
      bank: { type: String },
      wallet: { type: String },

      upi: upiSchema,
      netbanking: netbankingSchema,
      card: cardDetailSchema,
    },
  },
  { timestamps: true, versionKey: false }
);
