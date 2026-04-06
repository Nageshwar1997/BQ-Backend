import { model } from "mongoose";
import { AddressSchemas } from "../Address.Schemas";
import { AddressTypes } from "../Address.Types";

const Address = model<AddressTypes.IAddress>("Address", AddressSchemas.Address);

const UserAddress = model<AddressTypes.IUserAddresses>(
  "User-Address",
  AddressSchemas.UserAddress,
);

export const AddressModels = { Address, UserAddress };
