import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Address, UserAddress } from "../models";
import { AppError } from "../../../classes";

export const addAddressController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;

  const { isDefaultAddress, ...restBody } = req.body ?? {};

  const userAddress = await UserAddress.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, addresses: [], defaultAddress: null } },
    { new: true, upsert: true }
  );

  if (!userAddress) {
    throw new AppError("User address not found", 404);
  }

  const address = await Address.create({
    ...restBody,
    user: userId,
  });

  if (!address) {
    throw new AppError("Failed to add address", 500);
  }

  userAddress.addresses.push(address._id);
  if (isDefaultAddress || !userAddress.defaultAddress) {
    userAddress.defaultAddress = address._id;
  }
  await userAddress.save();

  res.success(200, "Address added successfully");
};
