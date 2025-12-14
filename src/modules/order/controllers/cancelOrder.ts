import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { ClientSession } from "mongoose";
import { Order } from "../models";
import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { ChatbotModule } from "../..";

export const cancelOrderController = async (
  req: AuthenticatedRequest,
  res: Response,
  _: NextFunction,
  session: ClientSession
) => {
  const { orderId } = req.params;
  const userId = req.user?._id;

  isValidMongoId(orderId, "Invalid Order Id provided", 404);

  const order = await Order.findOne({ _id: orderId, user: userId }, null, {
    session,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const currentStatus = order.order_result.order_status;

  if (currentStatus === "DELIVERED") {
    throw new AppError("Delivered order cannot be cancelled", 400);
  }

  if (currentStatus === "CANCELLED") {
    throw new AppError("Order already cancelled", 400);
  }

  if (currentStatus === "RETURNED") {
    throw new AppError("Returned order cannot be cancelled", 400);
  }

  order.order_result.order_status = "CANCELLED";
  order.order_result.cancelled_at = new Date();

  await order.save({ session });

  res.success(200, "Order cancelled successfully");

  (async () => {
    await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
  })();
};
