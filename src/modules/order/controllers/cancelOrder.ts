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
  _: NextFunction,
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

  // 🔹 Async tasks after response
  setImmediate(async () => {
    try {
      const isPaid =
        order.razorpay_payment_result.rzp_payment_status === "PAID";

      if (isPaid) {
        const paymentId = order.razorpay_payment_result.rzp_payment_id;
        if (paymentId) {
          const refundAmount = order.order_result.price * 100; // paise

          const refund = await razorpay.payments.refund(paymentId, {
            amount: refundAmount,
            notes: {
              orderId: order._id.toString(),
              reason: reason || "Order cancelled",
            },
          });

          // Update DB immediately (optional: will be confirmed by webhook)
          await Order.updateOne(
            { _id: order._id },
            {
              $set: {
                "payment_details.refund_status": refund.status,
                "payment_details.refund_id": refund.id,
                "payment_details.refunded_at": new Date(),
              },
            }
          );
        }
      }
    } catch (err) {
      console.error("RAZORPAY REFUND FAILED:", err);
      // Webhook / retry job will handle final refund status
    }

    // Chatbot update
    try {
      await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
    } catch (err) {
      console.error("Chatbot update failed:", err);
    }
  });
};
