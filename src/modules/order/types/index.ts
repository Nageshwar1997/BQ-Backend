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
  paymentMode: (typeof ALLOWED_PAYMENT_MODE)[number];
  currency: (typeof ALLOWED_CURRENCIES)[number];
  paymentResult?: {
    rzp_order_id: string;
    rzp_payment_id: string;
    rzp_signature: string;
    rzp_payment_method: (typeof RAZORPAY_PAYMENT_METHODS)[number];
    rzp_payment_status: (typeof RAZORPAY_PAYMENT_STATUS)[number];
    email: string;
    phoneNumber: string;
  };
  orderStatus: (typeof ORDER_STATUS)[number];
  totalPrice: number;
  discount: number;
  charges: number;
  returnedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
