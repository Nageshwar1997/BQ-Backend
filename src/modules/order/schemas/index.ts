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
  RAZORPAY_REFUND_PAYMENT_STATUS,
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

const upiSchema = new Schema(
  {
    rrn: { type: String },
    upi_transaction_id: { type: String },
    vpa: { type: String },
    flow: { type: String },
  },
  { _id: false }
);

const netbankingSchema = new Schema(
  {
    bank: { type: String },
    bank_transaction_id: { type: String },
  },
  { _id: false }
);

const cardDetailSchema = new Schema(
  {
    id: { type: String },
    name: { type: String },
    last4: { type: String },
    network: { type: String },
    type: { type: String },
    issuer: { type: String },
    token_id: { type: String },
    auth_code: { type: String },
  },
  { _id: false }
);

const detailSchema = new Schema(
  {
    email: { type: String },
    contact: { type: String },
    method: { type: String, enum: RAZORPAY_PAYMENT_METHODS },
    fee: { type: Number },
    tax: { type: Number },
    upi: upiSchema,
    card: cardDetailSchema,
    wallet: { type: String },
    netbanking: netbankingSchema,
  },
  { _id: false }
);

const razorpaySchema = new Schema(
  {
    order_id: { type: String },
    payment_id: { type: String },
    signature: { type: String },
    receipt: { type: String, unique: true },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    mode: { type: String, enum: ALLOWED_PAYMENT_MODE, default: "ONLINE" },
    currency: { type: String, enum: ALLOWED_CURRENCIES, default: "INR" },
    status: {
      type: String,
      enum: RAZORPAY_PAYMENT_STATUS,
      default: "UNPAID",
    },
    razorpay: razorpaySchema,
    amount: { type: Number, required: true, default: 0 },
    paid_at: { type: Date },
    receipt: { type: String, unique: true },
    details: detailSchema,
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
    payment: paymentSchema,
    discount: { type: Number, required: true, default: 0 },
    charges: { type: Number, default: 0 },
    status: { type: String, enum: ORDER_STATUS, default: "PENDING" },
    delivered_at: { type: Date },
    cancelled_at: { type: Date },
    returned_at: { type: Date },
    refunded_at: { type: Date },
    refund_status: { type: String, enum: RAZORPAY_REFUND_PAYMENT_STATUS },
  },
  { timestamps: true, versionKey: false }
);
