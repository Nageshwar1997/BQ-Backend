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

// Transaction sub-schema
const transactionSchema = new Schema(
  {
    // UPI Transaction
    upi_rrn: String,
    upi_transaction_id: String,
    upi_vpa: String,
    upi_flow: String,

    // CARD Transaction
    card_id: String,
    card_name: String,
    card_last4: String,
    card_network: String,
    card_type: String,
    card_issuer: String,
    card_token_id: String,
    card_auth_code: String,

    // WALLET Transaction
    wallet: String,

    // NETBANKING Transaction
    netbanking_bank_transaction_id: String,
    netbanking_bank: String,
  },
  { _id: false }
);

// Addresses sub-schema
const addressesSchema = new Schema(
  {
    shipping: orderAddressSchema,
    billing: orderAddressSchema,
    both: orderAddressSchema,
  },
  { _id: false }
);

// Payment sub-schema
const paymentSchema = new Schema(
  {
    mode: { type: String, enum: ALLOWED_PAYMENT_MODE, default: "ONLINE" },
    currency: { type: String, enum: ALLOWED_CURRENCIES, default: "INR" },
    status: { type: String, enum: RAZORPAY_PAYMENT_STATUS, default: "UNPAID" },
    email: String,
    contact: String,
    method: { type: String, enum: RAZORPAY_PAYMENT_METHODS },
    fee: Number,
    tax: Number,
    rzp_order_id: String,
    rzp_payment_id: String,
    rzp_signature: String,
    rzp_order_receipt: String,
    rzp_payment_receipt: String,
    amount: { type: Number, required: true, default: 0 },
    paid_at: Date,
  },
  { _id: false }
);

// Main order schema
export const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [orderProductSchema],
    reason: String,
    addresses: addressesSchema,
    transaction: transactionSchema,
    payment: paymentSchema,
    discount: { type: Number, required: true, default: 0 },
    charges: { type: Number, default: 0 },
    status: { type: String, enum: ORDER_STATUS, default: "PENDING" },
    delivered_at: Date,
    cancelled_at: Date,
    returned_at: Date,
    refunded_at: Date,
    refund_status: { type: String, enum: RAZORPAY_REFUND_PAYMENT_STATUS },
  },
  { timestamps: true, versionKey: false }
);
