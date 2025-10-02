import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Address, UserAddress } from "../models";
import { AppError } from "../../../classes";
import { ClientSession } from "mongoose";

export const addAddressController = async (
  req: AuthenticatedRequest,
  res: Response,
  _: NextFunction,
  session: ClientSession
) => {
  const userId = req.user?._id;

  const { isDefaultAddress, ...restBody } = req.body ?? {};

  const userAddresses = await UserAddress.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, addresses: [], defaultAddress: null } },
    { new: true, upsert: true, session }
  );

  if (!userAddresses) {
    throw new AppError("User address not found", 404);
  }

  const address = new Address({ ...restBody, user: userId });

  try {
    await address.save({ session });
  } catch {
    throw new AppError("Failed to add address", 400);
  }

  userAddresses.addresses.push(address._id);
  if (isDefaultAddress || !userAddresses.defaultAddress) {
    userAddresses.defaultAddress = address._id;
  }
  await userAddresses.save({ session });

  res.success(200, "Address added successfully");
};
