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

export const ORDER_STATUS_PRIORITY: Record<
  (typeof ORDER_STATUS)[number],
  number
> = {
  PENDING: 1,
  PROCESSING: 2,
  CONFIRMED: 3,
  DELIVERED: 4,

  FAILED: 0, // terminal
  CANCELLED: 0, // terminal
  RETURNED: 0, // terminal
};

export const PAYMENT_STATUS_PRIORITY: Record<
  (typeof RAZORPAY_PAYMENT_STATUS)[number],
  number
> = {
  UNPAID: 0,
  CAPTURED: 1,
  PAID: 2,
  REFUNDED: 3,
  FAILED: 0,
};

export const REFUND_STATUS_PRIORITY: Record<string, number> = {
  FAILED: 0, // Failed can overwrite anything
  REQUESTED: 1,
  APPROVED: 2,
  REFUNDED: 3,
};
