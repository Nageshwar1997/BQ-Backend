import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { AddressModels } from "../Address.Models";
import { AppError } from "../../../Classes";
import { ClientSession } from "mongoose";

export const AddAddressController = async (
  req: AuthenticatedRequest,
  res: Response,
  _: NextFunction,
  session: ClientSession,
) => {
  const userId = req.user?._id;

  const { isDefaultAddress, ...restBody } = req.body ?? {};

  const userAddresses = await AddressModels.UserAddress.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, addresses: [], defaultAddress: null } },
    { new: true, upsert: true, session },
  );

  if (!userAddresses) {
    throw new AppError({
      message: "User address not found",
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  const address = new AddressModels.Address({ ...restBody, user: userId });

  try {
    await address.save({ session });
  } catch {
    throw new AppError({ message: "Failed to add address", statusCode: 400 });
  }

  userAddresses.addresses.push(address._id);
  if (isDefaultAddress || !userAddresses.defaultAddress) {
    userAddresses.defaultAddress = address._id;
  }
  await userAddresses.save({ session });

  res.success(200, "Address added successfully");
};
