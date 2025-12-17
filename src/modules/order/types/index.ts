import { Types } from "mongoose";
import { AddressModule, CartProductModule } from "../..";
import {
  ALLOWED_CURRENCIES,
  ALLOWED_PAYMENT_MODE,
  ORDER_STATUS,
  RAZORPAY_PAYMENT_METHODS,
  RAZORPAY_PAYMENT_STATUS,
  RAZORPAY_REFUND_PAYMENT_STATUS,
} from "../constants";

export interface IOrder {
  _id: Types.ObjectId | string;
  user: Types.ObjectId;
  products: CartProductModule.Types.IPopulatedCartProduct[];
  addresses: {
    shipping: Omit<AddressModule.Types.IAddress, "user"> | null;
    billing: Omit<AddressModule.Types.IAddress, "user"> | null;
    both: Omit<AddressModule.Types.IAddress, "user"> | null;
  };
  payment: {
    mode: (typeof ALLOWED_PAYMENT_MODE)[number];
    status: (typeof RAZORPAY_PAYMENT_STATUS)[number];
    currency: (typeof ALLOWED_CURRENCIES)[number];
    rzp_order_id?: string;
    rzp_payment_id?: string;
    rzp_signature?: string;
    rzp_order_receipt: string;
    rzp_payment_receipt?: string;
    amount: number;
    paid_at?: Date;
    email: string;
    contact: string;
    method: (typeof RAZORPAY_PAYMENT_METHODS)[number];
    fee: number;
    tax: number;
  };
  transaction?: {
    // UPI Transaction
    upi_rrn?: string;
    upi_transaction_id?: string;
    upi_vpa?: string;
    upi_flow?: string;

    // CARD Transaction
    card_token_id?: string;
    card_auth_code?: string;
    card_id?: string;
    card_name?: string;
    card_last4?: string;
    card_network?: string;
    card_type?: string;
    card_issuer?: string;

    // WALLET Transaction
    wallet?: string;

    // NETBANKING Transaction
    netbanking_bank_transaction_id?: string;
    netbanking_bank?: string;
  };
  refund_status: (typeof RAZORPAY_REFUND_PAYMENT_STATUS)[number];
  discount: number;
  charges: number;
  status: (typeof ORDER_STATUS)[number];
  delivered_at?: Date;
  cancelled_at?: Date;
  returned_at?: Date;
  refunded_at?: Date;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}
