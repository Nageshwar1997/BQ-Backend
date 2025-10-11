import { Types } from "mongoose";
import { AddressModule, CartProductModule } from "../..";
import {
  ALLOWED_CURRENCIES,
  ALLOWED_PAYMENT_MODE,
  ORDER_STATUS,
  RAZORPAY_PAYMENT_METHODS,
  RAZORPAY_PAYMENT_STATUS,
} from "../constants";

export interface IOrder {
  user: Types.ObjectId;
  products: CartProductModule.Types.IPopulatedCartProduct[];
  addresses: {
    shipping: Omit<AddressModule.Types.IAddress, "user"> | null;
    billing: Omit<AddressModule.Types.IAddress, "user"> | null;
    both: Omit<AddressModule.Types.IAddress, "user"> | null;
  };
  razorpay_payment_result: {
    payment_mode: (typeof ALLOWED_PAYMENT_MODE)[number];
    currency: (typeof ALLOWED_CURRENCIES)[number];
    rzp_order_id: string;
    rzp_payment_id: string;
    rzp_signature: string;
    payment_method: (typeof RAZORPAY_PAYMENT_METHODS)[number];
    rzp_payment_status: (typeof RAZORPAY_PAYMENT_STATUS)[number];
  };
  order_result: {
    order_status: (typeof ORDER_STATUS)[number];
    price: number;
    discount: number;
    charges: number;
    order_receipt: string;
    paid_at?: Date;
    delivered_at?: Date;
    cancelled_at?: Date;
    returned_at?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
