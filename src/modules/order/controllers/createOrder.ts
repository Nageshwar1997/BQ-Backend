import { Response } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { AddressModule, CartModule } from "../..";
import { AppError } from "../../../classes";
import { razorpay } from "../../../configs";
import { IOrder } from "../types";
import { IAddress } from "../../address/types";

export const createOrderController = async (
  req: AuthenticatedRequest,
  res: Response
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

  let razorpayOrder;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: (totalPrice + charges) * 100, // Price in paise
      currency: "INR", // Currency
      receipt: `order_receipt_${Date.now()}`,
      payment_capture: true,
      notes: {
        buyer_id: `${user?._id}`,
        buyer_name: `${user?.firstName} ${user?.lastName}`,
        buyer_email: `${user?.email}`,
        buyer_contact: `${user?.phoneNumber}`,
        buyer_device_ip: req.ip || "",
        buyer_device_user_agent: req.headers?.["user-agent"] || "",
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new AppError("Payment gateway error, please try again later", 502);
  }

  const orderBody = {
    user: new Types.ObjectId(user?._id),
    products: cart.products || [],
    addresses: {} as IOrder["addresses"],
    razorpay_payment_result: {
      rzp_payment_status: "UNPAID",
      currency: "INR",
      payment_mode: "ONLINE",
    },
    order_result: {
      order_status: "PENDING",
      charges,
      discount,
      price: totalPrice + charges,
      order_receipt: razorpayOrder.receipt,
    },
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

  res.success(201, "Order created successfully", {
    orderId: order._id,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });
};
