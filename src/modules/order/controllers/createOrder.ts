import { Response } from "express";
import { Types } from "mongoose";

import { AuthenticatedRequest } from "../../../types";
import { Order } from "../models";
import { AddressModule, CartModule, CartProductModule } from "../..";
import { AppError } from "../../../classes";
import { IOrder } from "../types";

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { addresses } = req.body ?? {};

  if (!addresses) {
    throw new AppError("Addresses are required", 400);
  }
  const cart = await CartModule.Services.getUserCart(req);

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

  const foundAddresses: Omit<AddressModule.Types.IAddress, "user">[] =
    await AddressModule.Models.Address.find({
      user: userId,
      _id: { $in: addressIds },
    }).lean();

  if (!foundAddresses) {
    throw new AppError("Address not found", 404);
  }

  const totalPrice = cart.products.reduce((acc, product) => {
    return acc + product.product.sellingPrice * product.quantity;
  }, 0);

  const discount = cart.products.reduce((acc, product) => {
    return acc + product.product.discount;
  }, 0);

  let updatedCart;

  if (totalPrice < 499) {
    updatedCart = await CartModule.Models.Cart.findOneAndUpdate(
      { user: userId },
      { $set: { charges: 40 } },
      { new: true }
    );
  }

  const orderBody: Pick<
    IOrder,
    "user" | "products" | "addresses" | "totalPrice" | "discount" | "charges"
  > = {
    user: new Types.ObjectId(userId),
    products: cart.products || [],
    discount,
    totalPrice,
    charges: updatedCart?.charges ?? 0,
    addresses: { shipping: null, billing: null, both: null },
  };

  foundAddresses.forEach((address) => {
    if (address.type === "shipping") {
      orderBody.addresses.shipping = address;
    } else if (address.type === "billing") {
      orderBody.addresses.billing = address;
    } else if (address.type === "both") {
      orderBody.addresses.both = address;
    }
  });

  const order = new Order(orderBody);
  const createdOrder = await order.save();
  res.success(201, "Order created successfully", {
    cart,
    createdOrder,
    orderBody,
  });
};
