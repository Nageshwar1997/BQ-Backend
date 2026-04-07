import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { addressModels } from "../models";

export const getUserAddressesController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?._id;

  const userAddresses = await addressModels.UserAddress.findOne({
    user: userId,
  }).populate("addresses");

  res.success(200, "User address fetched successfully", { userAddresses });
};
