import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { UserAddress } from "../models";

export const addAddressController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?._id;

  const userAddress = await UserAddress.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, addresses: [], defaultAddress: null } },
    { new: true, upsert: true }
  );

  res.success(200, "Address added successfully", { data: req.body });
};
