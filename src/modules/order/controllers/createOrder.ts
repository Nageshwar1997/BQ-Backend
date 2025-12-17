import { NextFunction, Response } from "express";
import { ClientSession, Types } from "mongoose";
import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { AddressModule, CartModule, ChatbotModule } from "../..";
import { AppError } from "../../../classes";
import { IOrder } from "../types";
import { IAddress } from "../../address/types";
import { rzp_create_order } from "../services";

export const createOrderController = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const user = req.user;
  const { billing, shipping, both } = req.query;

  const cart = await CartModule.Services.getUserCart(req);

  if (cart.products.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const addressIds = [];

  if (shipping && !billing) {
    throw new AppError("Billing address is required", 400);
  } else if (billing && !shipping) {
    throw new AppError("Shipping address is required", 400);
  } else if (billing && shipping) {
    addressIds.push(shipping, billing);
  } else {
    addressIds.push(both);
  }

  const foundAddresses: IAddress[] = await AddressModule.Models.Address.find({
    user: user?._id,
    _id: { $in: addressIds },
  }).lean();

  if (!foundAddresses?.length) throw new AppError("Address not found", 404);

  const totalPrice = cart.products.reduce(
    (acc, item) => acc + item.product.sellingPrice * item.quantity,
    0
  );

  const discount = cart.products.reduce(
    (acc, item) => acc + item.product.discount,
    0
  );
  const charges = totalPrice < 499 ? 40 : 0;

  const orderBody = {
    user: new Types.ObjectId(user?._id),
    products: cart.products || [],
    addresses: {} as IOrder["addresses"],
    payment: {
      mode: "ONLINE",
      currency: "INR",
      status: "UNPAID",
      amount: totalPrice + charges,
    },
    discount,
    charges,
    status: "PENDING",
  };
  if (foundAddresses.length === 1 && both) {
    orderBody.addresses.both = foundAddresses[0];
  } else {
    foundAddresses.forEach((address) => {
      if (address.type === "shipping") orderBody.addresses.shipping = address;
      else if (address.type === "billing")
        orderBody.addresses.billing = address;
    });
  }

  const order = await new Order(orderBody).save();

  if (!order) {
    throw new AppError("Failed to create order", 400);
  }

  const razorpayOrder = await rzp_create_order(
    user!,
    totalPrice + charges,
    order._id.toString()
  );

  if (razorpayOrder) {
    order.payment.rzp_order_id = razorpayOrder.id;
    order.payment.rzp_order_receipt =
      razorpayOrder.receipt ||
      `order_receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    await order.save();
  }

  res.success(201, "Order created successfully", {
    orderId: order._id,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });

  // Create embedded order in chatbot (Background task)
  (async () => {
    await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
  })();
};
