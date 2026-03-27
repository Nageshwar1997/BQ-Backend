import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { Address, UserAddress } from "../models";
import { AppError } from "../../../classes";
import { ClientSession } from "mongoose";
import { isValidMongoId } from "../../../utils";
import { IAddress } from "../types";

export const updateAddressController = async (
  req: AuthenticatedRequest,
  res: Response,
  _: NextFunction,
  session: ClientSession
) => {
  const userId = req.user?._id;
  const { addressId } = req.params;

  isValidMongoId(addressId, "Invalid Address Id provided", 404);

  const { isDefaultAddress, removedOptionalFields, ...restBody } =
    req.body ?? {};

  const updateBody = { ...restBody };

  if (removedOptionalFields?.length) {
    removedOptionalFields.forEach(
      (
        field: keyof Partial<
          Pick<IAddress, "altPhoneNumber" | "gst" | "landmark">
        >
      ) => {
        // if the optional fields removed then make them empty
        updateBody[field] = "";
      }
    );
  }

  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, user: userId },
    { $set: updateBody },
    { new: true, session }
  );

  if (!updatedAddress) {
    throw new AppError({ message: "Address not found", statusCode: 404, code: "NOT_FOUND" });
  }

  if (isDefaultAddress) {
    const updatedUserAddress = await UserAddress.findOneAndUpdate(
      { user: userId },
      { $set: { defaultAddress: addressId } },
      { new: true, session }
    );
    if (!updatedUserAddress) {
      throw new AppError({ message: "User addresses not found", statusCode: 404, code: "NOT_FOUND" });
    }
  }

  res.success(200, "Address updated successfully");
};
