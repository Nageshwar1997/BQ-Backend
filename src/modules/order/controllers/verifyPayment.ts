// controllers/verify.controller.ts
import { Response } from "express";
import crypto from "crypto";
import { Order } from "../models";
import { AppError } from "../../../classes";
import { RAZORPAY_KEY_SECRET } from "../../../envs";
import { AuthenticatedRequest } from "../../../types";
import { razorpay } from "../../../configs";

export const verifyPaymentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderDBId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderDBId
  )
    throw new AppError("Missing required fields", 400);

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET!)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Invalid signature", 400);
  }

  const payment = await razorpay.payments.fetch(razorpay_payment_id);

  if (!payment || payment.status !== "captured") {
    throw new AppError("Payment not captured", 400);
  }

  console.log("payment", payment);

  const order = await Order.findByIdAndUpdate(
    orderDBId,
    {
      $set: {
        "razorpay_payment_result.rzp_order_id": razorpay_order_id,
        "razorpay_payment_result.rzp_payment_id": razorpay_payment_id,
        "razorpay_payment_result.rzp_signature": razorpay_signature,
        "razorpay_payment_result.rzp_payment_status": "PAID",
        "order_result.paid_at": new Date(payment.created_at * 1000),
        "order_result.order_status": "CONFIRMED",
        "order_result.payment_receipt": `payment_receipt_${Date.now()}`,
      },
    },
    { new: true }
  );

  if (!order) throw new AppError("Order not found", 404);

  res.success(200, "Payment verified successfully", { order, payment });
};
