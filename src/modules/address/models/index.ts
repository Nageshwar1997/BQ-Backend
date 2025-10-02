import { model } from "mongoose";
import { addressSchema, userAddressesSchema } from "../schemas";
import { IAddress, IUserAddresses } from "../types";

export const Address = model<IAddress>("Address", addressSchema);

export const UserAddress = model<IUserAddresses>(
  "User-Address",
  userAddressesSchema
);
