import { model } from "mongoose";
import { AddressSchemas } from "../Address.Schemas";
import { IAddress, IUserAddresses } from "../Address.Types";

const Address = model<IAddress>("Address", AddressSchemas.Address);

const UserAddress = model<IUserAddresses>(
  "User-Address",
  AddressSchemas.UserAddress,
);

export const AddressModels = { Address, UserAddress };
