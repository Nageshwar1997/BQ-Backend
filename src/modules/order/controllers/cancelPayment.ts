import { Response } from "express";
import { Order } from "../models";
import { AppError } from "../../../classes";
import { AuthenticatedRequest } from "../../../types";
import { isValidMongoId } from "../../../utils";
import { ChatbotModule } from "../..";

export const cancelPaymentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { orderId } = req.params;

  isValidMongoId(orderId, "Invalid Order Id provided", 404);

  const order = await Order.findById(orderId);

  if (!order) throw new AppError("Order not found", 404);

  if (user?._id?.toString() !== order?.user?.toString()) {
    throw new AppError("You can not cancel another user's order", 401);
  }

  await order.updateOne({
    $set: {
      "razorpay_payment_result.rzp_payment_status": "CANCELLED",
      "order_result.order_status": "PENDING",
    },
  });

  res.success(200, "Payment cancelled successfully");

  (async () => {
    await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
  })();
};
