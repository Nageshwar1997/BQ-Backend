import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { isValidMongoId } from "../../../utils";

export const getOrderByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;
  let { orderId } = req.params;

  isValidMongoId(orderId, "Invalid Order Id provided", 404);

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate({
      path: "products.product",
      select: "title sellingPrice originalPrice commonImages",
      options: { slice: { commonImages: 1 } },
    })
    .populate({
      path: "products.shade",
      select: "shadeName images",
      options: { slice: { images: 1 } },
    })
    .lean();

  res.success(200, "Orders fetched successfully", {
    order,
  });
};
