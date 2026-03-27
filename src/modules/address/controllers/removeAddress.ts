import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Address, UserAddress } from "../models";
import { AppError } from "../../../classes";
import { ClientSession } from "mongoose";
import { isValidMongoId } from "../../../utils";

export const removeAddressController = async (
  req: AuthenticatedRequest,
  res: Response,
  _: NextFunction,
  session: ClientSession
) => {
  const userId = req.user?._id;
  const { addressId } = req.params;

  isValidMongoId(addressId, "Invalid Address Id provided", 404);

  // Find the address first
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  }).session(session);

  if (!address) {
    throw new AppError({ message: "Address not found", statusCode: 404, code: "NOT_FOUND" });
  }

  // Check if this is the user's default address
  const userAddress = await UserAddress.findOne({ user: userId }).session(
    session
  );
  const isDefaultAddress =
    userAddress?.defaultAddress?.toString() === addressId;

  // Delete address and update UserAddress in parallel
  const [deletedAddress, updatedUserAddress] = await Promise.all([
    Address.findOneAndDelete({ _id: addressId, user: userId }).session(session),
    isDefaultAddress
      ? UserAddress.findOneAndUpdate(
          { user: userId },
          { $set: { defaultAddress: null }, $pull: { addresses: addressId } },
          { new: true, session }
        )
      : Promise.resolve(null),
  ]);

  if (!deletedAddress) {
    throw new AppError({ message: "Address not found", statusCode: 404, code: "NOT_FOUND" });
  }

  if (!updatedUserAddress && isDefaultAddress) {
    throw new AppError({ message: "User addresses not found", statusCode: 404, code: "NOT_FOUND" });
  }

  res.success(200, "Address removed successfully");
};
