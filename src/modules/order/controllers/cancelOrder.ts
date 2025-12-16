import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { ClientSession } from "mongoose";
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

  const status = order.order_result.order_status;

  if (["DELIVERED", "RETURNED"].includes(status)) {
    throw new AppError("Order cannot be cancelled", 400);
  }

  if (status === "CANCELLED") {
    throw new AppError("Order already cancelled", 400);
  }

  // ✅ Cancel order
  order.order_result.order_status = "CANCELLED";
  order.order_result.cancelled_at = new Date();

  await order.save({ session });

  res.success(200, "Order cancelled successfully");

  // 🔁 Async tasks (gated, safe)
  setImmediate(async () => {
    try {
      const isPaid = order.payment.status === "PAID";

      const paymentId = order.payment.razorpay.payment_id;

      // Refund initiate only if payment captured
      if (isPaid && paymentId) {
        await razorpay.payments.refund(paymentId, {
          amount: order.order_result.price * 100, // INR → paise
          notes: {
            db_order_id: order._id.toString(),
            reason: reason || "Order cancelled",
          },
        });

        // Mark refund as REQUESTED (final status will be confirmed by webhook )
        await Order.updateOne(
          { _id: order._id },
          {
            $set: {
              "payment_details.refund_status": "REQUESTED",
            },
          }
        );
      }

      // Chatbot update sync (non-critical)
      await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
    } catch (err) {
      console.error("Cancel order async task failed:", err);
    }
  });
};
