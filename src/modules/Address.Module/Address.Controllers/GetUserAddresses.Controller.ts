import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { AddressModels } from "../Address.Models";

export const GetUserAddressesController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?._id;

  const userAddresses = await AddressModels.UserAddress.findOne({
    user: userId,
  }).populate("addresses");

  res.success(200, "User address fetched successfully", { userAddresses });
};
