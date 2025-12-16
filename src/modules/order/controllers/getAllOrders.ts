import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { AppError } from "../../../classes";
import { IOrder } from "../types";
import { FilterQuery } from "mongoose";
import { toArray } from "../../../utils";

export const getAllOrdersController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;
  let { order_status, payment_status, page, limit } = req.query;

  const orderStatuses = toArray(order_status);
  const paymentStatuses = toArray(payment_status);

  const pageNum = page ? Number(page) : 0;
  const limitNum = limit ? Number(limit) : 0;
  const skip = pageNum && limitNum ? (pageNum - 1) * limitNum : 0;

  const filter: FilterQuery<IOrder> = { user: userId };

  if (orderStatuses.length) {
    filter["order_result.order_status"] = {
      $in: orderStatuses.map((s) => new RegExp(`^${s}$`, "i")),
    };
  }

  if (paymentStatuses.length) {
    filter["payment.status"] = {
      $in: paymentStatuses.map((s) => new RegExp(`^${s}$`, "i")),
    };
  }

  let query = Order.find(filter)
    .sort({ createdAt: -1 })
    .populate({
      path: "products.product",
      select: "title sellingPrice originalPrice commonImages",
      options: { slice: { commonImages: 1 } },
    })
    .populate({
      path: "products.shade",
      select: "shadeName images",
      options: { slice: { images: 1 } },
    });

  if (pageNum && limitNum) {
    query = query.skip(skip).limit(limitNum);
  }

  const orders = await query.lean();

  const totalOrders = await Order.countDocuments(filter);

  if (!orders?.length) throw new AppError("Orders not found", 404);

  res.success(200, "Orders fetched successfully", {
    orders,
    totalOrders,
    currentPage: pageNum || 1,
    totalPages: pageNum && limitNum ? Math.ceil(totalOrders / limitNum) : 1,
  });
};
