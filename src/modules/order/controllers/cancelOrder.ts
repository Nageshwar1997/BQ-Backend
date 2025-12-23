import { NextFunction, Response } from "express";
import { ClientSession } from "mongoose";
import { INormalizeError } from "razorpay/dist/types/api";
import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { ChatbotModule } from "../..";
import { razorpay } from "../../../configs";

export const cancelOrderController = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const { orderId } = req.params;
  const { reason } = req.body ?? {};
  const userId = req.user?._id;

  isValidMongoId(orderId, "Invalid Order Id provided", 404);

  const order = await Order.findOne({ _id: orderId, user: userId }, null, {
    session,
  });

  if (!order) throw new AppError("Order not found", 404);

  const status = order.status;

  if (["DELIVERED", "RETURNED"].includes(status)) {
    throw new AppError("Order cannot be cancelled", 400);
  }

  if (status === "CANCELLED") {
    throw new AppError("Order already cancelled", 400);
  }

  const isPaid = order.payment.status === "PAID";
  const paymentId = order.payment.rzp_payment_id;

  if (isPaid && paymentId) {
    try {
      await razorpay.payments.refund(paymentId, {
        amount: order.payment.amount * 100,
        notes: {
          db_order_id: order._id.toString(),
          reason: reason || "Order cancelled",
        },
      });

      order.refund_status = "REQUESTED";
    } catch (err) {
      console.error("Razorpay refund failed:", err);

      throw new AppError(
        (err as INormalizeError)?.error?.description ||
          "Refund failed. Order was not cancelled. Please try again.",
        500
      );
    }
  }

  order.status = "CANCELLED";
  order.cancelled_at = new Date();
  order.reason = reason;

  await order.save({ session });

  res.success(200, "Order cancelled successfully");

  setImmediate(async () => {
    try {
      await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
    } catch (err) {
      console.log("Chatbot update failed:", err);
    }
  });
};
