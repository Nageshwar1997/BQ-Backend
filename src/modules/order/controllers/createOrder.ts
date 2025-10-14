import { Response } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { AddressModule, CartModule } from "../..";
import { AppError } from "../../../classes";
import { razorpay } from "../../../configs";
import { IOrder } from "../types";

export const createOrderController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { addresses } = req.body;

  if (!addresses) throw new AppError("Addresses required", 400);

  const cart = await CartModule.Services.getUserCart(req);

  if (cart.products.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const addressIds: Types.ObjectId[] = [];

  if (addresses.shipping && !addresses.billing) {
    throw new AppError("Billing address is required", 400);
  } else if (addresses.billing && !addresses.shipping) {
    throw new AppError("Shipping address is required", 400);
  } else if (addresses.billing && addresses.shipping) {
    addressIds.push(addresses.shipping, addresses.billing);
  } else {
    addressIds.push(addresses.both);
  }

  const foundAddresses = await AddressModule.Models.Address.find({
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
      receipt: `payment_receipt_${Date.now()}`,
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

  const orderBody: Pick<IOrder, "user" | "products" | "addresses"> & {
    razorpay_payment_result: Partial<IOrder["razorpay_payment_result"]>;
    order_result: Partial<IOrder["order_result"]>;
  } = {
    user: new Types.ObjectId(user?._id),
    products: cart.products || [],
    addresses: { shipping: null, billing: null, both: null },
    razorpay_payment_result: {
      rzp_payment_status: "UNPAID",
      currency: "INR",
      payment_mode: "ONLINE",
    },
    order_result: {
      order_status: "PENDING",
      charges,
      discount,
      price: totalPrice,
      order_receipt: razorpayOrder.receipt,
    },
  };
  foundAddresses.forEach((address) => {
    if (address.type === "shipping") orderBody.addresses.shipping = address;
    else if (address.type === "billing") orderBody.addresses.billing = address;
    else if (address.type === "both") orderBody.addresses.both = address;
  });

  const order = await new Order(orderBody).save();

  res.success(201, "Order created successfully", {
    message: "Order created successfully",
    order,
    razorpayOrder,
  });
};
