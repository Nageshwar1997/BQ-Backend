import { addAddressController } from "./addAddress.controller";
import { getUserAddressesController } from "./getUserAddresses.controller";
import { removeAddressController } from "./removeAddress.controller";
import { updateAddressController } from "./updateAddress.controller";

export const addressControllers = {
  add: addAddressController,
  update: updateAddressController,
  delete: removeAddressController,
  get: getUserAddressesController,
};
