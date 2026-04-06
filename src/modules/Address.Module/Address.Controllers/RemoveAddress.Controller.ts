import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { AddressModels } from "../Address.Models";
import { AppError } from "../../../Classes";
import { ClientSession } from "mongoose";
import { isValidMongoId } from "../../../utils";

export const RemoveAddressController = async (
  req: AuthenticatedRequest,
  res: Response,
  _: NextFunction,
  session: ClientSession,
) => {
  const userId = req.user?._id;
  const { addressId } = req.params;

  isValidMongoId(addressId, "Invalid Address Id provided", 404);

  // Find the address first
  const address = await AddressModels.Address.findOne({
    _id: addressId,
    user: userId,
  }).session(session);

  if (!address) {
    throw new AppError({
      message: "Address not found",
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  // Check if this is the user's default address
  const userAddress = await AddressModels.UserAddress.findOne({
    user: userId,
  }).session(session);
  const isDefaultAddress =
    userAddress?.defaultAddress?.toString() === addressId;

  // Delete address and update UserAddress in parallel
  const [deletedAddress, updatedUserAddress] = await Promise.all([
    AddressModels.Address.findOneAndDelete({
      _id: addressId,
      user: userId,
    }).session(session),
    isDefaultAddress
      ? AddressModels.UserAddress.findOneAndUpdate(
          { user: userId },
          { $set: { defaultAddress: null }, $pull: { addresses: addressId } },
          { new: true, session },
        )
      : Promise.resolve(null),
  ]);

  if (!deletedAddress) {
    throw new AppError({
      message: "Address not found",
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  if (!updatedUserAddress && isDefaultAddress) {
    throw new AppError({
      message: "User addresses not found",
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  res.success(200, "Address removed successfully");
};
