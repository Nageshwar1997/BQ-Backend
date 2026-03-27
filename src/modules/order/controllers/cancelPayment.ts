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
  const { flag } = req.body ?? {};

  isValidMongoId(orderId, "Invalid Order Id provided", 404);

  const order = await Order.findById(orderId);

  if (!order) throw new AppError({ message: "Order not found", statusCode: 404, code: "NOT_FOUND" });

  if (user?._id?.toString() !== order?.user?.toString()) {
    throw new AppError({ message: "You can not cancel another user's order", statusCode: 401, code: "AUTH_ERROR" });
  }

  let isOrderUpdated = false;

  if (order.payment.status === "UNPAID" && order.status === "PENDING") {
    order.payment.status = "FAILED";
    order.status = "FAILED";
    order.reason =
      flag === "tab_closed"
        ? "Payment failed: tab closed by user"
        : flag === "modal_closed"
        ? "Payment failed: modal closed by user"
        : "Payment failed: cancelled by user";

    await order.save();

    isOrderUpdated = true;
  }

  res.success(200, "Payment cancelled successfully");

  if (isOrderUpdated) {
    setImmediate(async () => {
      await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
    });
  }
};
