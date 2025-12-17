import { Payments } from "razorpay/dist/types/payments";
export interface IRazorPayPayment extends Payments.RazorpayPayment {
  upi?: { vpa?: string; flow?: string };
}
