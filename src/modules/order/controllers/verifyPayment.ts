import { NextFunction, Response } from "express";
import { ClientSession } from "mongoose";
import crypto from "crypto";

import { Order } from "../models";
import { AppError } from "../../../classes";
import { RAZORPAY_KEY_SECRET } from "../../../envs";
import { AuthenticatedRequest } from "../../../types";
import { razorpay } from "../../../configs";
import {
  CartModule,
  CartProductModule,
  ChatbotModule,
  ProductModule,
} from "../..";
import { IOrder } from "../types";

export const verifyPaymentController = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const user = req.user;
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
  let order: IOrder | null = null;

  try {
    order = await Order.findByIdAndUpdate(
      orderDBId,
      {
        $set: {
          "razorpay_payment_result.rzp_order_id": razorpay_order_id,
          "razorpay_payment_result.rzp_payment_id": razorpay_payment_id,
          "razorpay_payment_result.rzp_signature": razorpay_signature,
          "razorpay_payment_result.rzp_payment_status": "PAID",
          "payment_details.method": payment.method?.toUpperCase() || "OTHER",
          ...(payment.refund_status && {
            "payment_details.refund_status": payment.refund_status,
          }),
          ...(payment.bank && {
            "payment_details.bank": payment.bank,
          }),
          ...(payment.wallet && {
            "payment_details.wallet": payment.wallet,
          }),
          ...(payment.email && {
            "payment_details.email": payment.email,
          }),
          ...(payment.contact && {
            "payment_details.contact": payment.contact,
          }),
          "payment_details.fee": payment.fee ? Number(payment.fee) / 100 : 0,
          "payment_details.tax": payment.tax ? Number(payment.tax) / 100 : 0,
          ...(payment.vpa &&
            payment.acquirer_data?.upi_transaction_id && {
              "payment_details.upi": {
                acquirer_data: {
                  rrn: payment.acquirer_data?.rrn,
                  upi_transaction_id: payment.acquirer_data?.upi_transaction_id,
                  vpa: payment.vpa,
                },
              },
            }),
          ...(payment.acquirer_data.bank_transaction_id && {
            "payment_details.netbanking": {
              acquirer_data: {
                bank_transaction_id: payment.acquirer_data.bank_transaction_id,
              },
            },
          }),
          ...((payment.token_id || payment.card) && {
            "payment_details.card": {
              ...(payment.token_id && {
                token_id: payment.token_id,
              }),
              ...(payment.card && {
                card: {
                  id: payment.card.id,
                  name: payment.card.name,
                  last4: payment.card.last4,
                  network: payment.card.network,
                  type: payment.card.type,
                  issuer: payment.card.issuer,
                },
              }),
            },
          }),

          "order_result.paid_at": new Date(payment.created_at * 1000),
          "order_result.order_status": "CONFIRMED",
          "order_result.payment_receipt": `payment_receipt_${Date.now()}`,
        },
      },
      { new: true, session }
    );

    if (!order) throw new AppError("Order not found", 404);

    // Update product and shade stock
    for (const item of order.products) {
      await ProductModule.Models.Product.updateOne(
        { _id: item.product._id },
        { $inc: { totalStock: -item.quantity } },
        { session }
      );

      if (item.shade?._id) {
        await ProductModule.Models.Shade.updateOne(
          { _id: item.shade._id },
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    }

    //  Clear user cart
    const cart = await CartModule.Models.Cart.findOne(
      { user: user?._id },
      null,
      { session }
    );
    if (!cart) throw new AppError("Cart not found", 404);

    await CartProductModule.Models.CartProduct.deleteMany(
      {
        _id: { $in: cart.products.map((p) => p._id) },
      },
      { session }
    );

    await cart.updateOne(
      {
        $set: {
          products: [],
          charges: 0,
        },
      },
      { session }
    );
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Failed to update payment status.",
      500
    );
  }

  res.success(200, "Payment verified successfully");
  // Create embedded order in chatbot (Background task)
  (async () => {
    await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
  })();
};
