import { AddressModels } from "./Address.Models";
import { AddressRouter } from "./Address.Routes";

export type * as TAddressModule from "./Address.Types";
export const AddressModule = {
  Models: AddressModels,
  Router: AddressRouter,
};
