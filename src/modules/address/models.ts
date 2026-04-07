import { model } from "mongoose";
import { addressSchemas } from "./schemas";
import { IAddress, IUserAddresses } from "./types";

const Address = model<IAddress>("Address", addressSchemas.address);

const UserAddress = model<IUserAddresses>(
  "User-Address",
  addressSchemas.userAddress,
);

export const addressModels = { Address, UserAddress };
