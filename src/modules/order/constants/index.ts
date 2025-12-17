export const ALLOWED_PAYMENT_MODE = ["ONLINE"];
export const ALLOWED_CURRENCIES = ["INR"];

export const ORDER_STATUS = [
  "PENDING",
  "FAILED",
  "PROCESSING",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export const RAZORPAY_PAYMENT_METHODS = [
  "CARD",
  "UPI",
  "NETBANKING",
  "WALLET",
  // "PAYLATER", // *LINK - Not Implemented yet in FRONTEND & BACKEND
  // "EMI", // *LINK - Not Implemented yet in FRONTEND & BACKEND
  "OTHER",
];

export const RAZORPAY_PAYMENT_STATUS = [
  "UNPAID",
  "CAPTURED",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export const RAZORPAY_REFUND_PAYMENT_STATUS = [
  "REQUESTED",
  "APPROVED",
  "REFUNDED",
  "FAILED",
];
