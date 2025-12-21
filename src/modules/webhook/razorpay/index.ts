import { Request, Response } from "express";
import crypto from "crypto";
import { RAZORPAY_WEBHOOK_SECRET } from "../../../envs";
import { AppError } from "../../../classes";
import { ChatbotModule, OrderModule } from "../..";
import { isValidMongoId } from "../../../utils";
import { IRazorPayPayment } from "./types";
import { RAZORPAY_ACTIVE_EVENTS } from "../../../constants";
import {
  canUpdateOrderStatus,
  canUpdatePaymentStatus,
  get_rzp_OrderUpdateBody,
} from "./utils";

export const razorpayWebhooksController = async (
  req: Request,
  res: Response
) => {
  const { body } = req;
  const secret = RAZORPAY_WEBHOOK_SECRET!;

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  const receivedSignature = req.headers["x-razorpay-signature"];

  if (expectedSignature !== receivedSignature) {
    console.log("Invalid signature");
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = body.event;
  const payment: IRazorPayPayment = body?.payload?.payment?.entity;

  if (!payment) {
    console.log("Payment payload missing");
    throw new AppError("Payment payload missing", 400);
  }

  const orderDBId = payment?.notes?.db_order_id;
  const userId = payment?.notes?.buyer_id;

  isValidMongoId(orderDBId, "Invalid order id in notes", 400);
  isValidMongoId(userId, "Invalid user id in notes", 400);

  const order = await OrderModule.Models.Order.findById(orderDBId);
  if (!order) {
    console.log("Order not found");
    throw new AppError("Order not found", 404);
  }

  const updatePayload = get_rzp_OrderUpdateBody(
    event,
    payment,
    receivedSignature,
    order
  );

  // Safe update: only if not terminal states
  if (Object.keys(updatePayload).length) {
    const updatedOrder = await OrderModule.Models.Order.findOneAndUpdate(
      { _id: orderDBId },
      { $set: updatePayload },
      { new: true }
    );

    res.success(200, "Webhook processed successfully");

    if (updatedOrder) {
      // Only notify AI model if status changed
      const paymentChanged = canUpdatePaymentStatus(
        order.payment.status,
        updatedOrder.payment.status
      );
      const orderChanged = canUpdateOrderStatus(
        order.status,
        updatedOrder.status
      );

      if (paymentChanged || orderChanged) {
        setImmediate(async () => {
          if (RAZORPAY_ACTIVE_EVENTS.includes(event)) {
            await ChatbotModule.Services.createOrUpdateEmbeddedOrder({
              order: updatedOrder,
            });
          }
        });
      }
    }
  } else {
    res.success(200, "Even ignored");
  }
};
