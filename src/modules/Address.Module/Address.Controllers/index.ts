import { AddAddressController } from "./AddAddress.Controller";
import { GetUserAddressesController } from "./GetUserAddresses.Controller";
import { RemoveAddressController } from "./RemoveAddress.Controller";
import { UpdateAddressController } from "./UpdateAddress.Controller";

export const AddressControllers = {
  AddAddress: AddAddressController,
  UpdateAddress: UpdateAddressController,
  RemoveAddress: RemoveAddressController,
  GetUserAddresses: GetUserAddressesController,
};
