import { AddressModels } from "./Address.Models";
import { AddressRouter } from "./Address.Routes";
import * as AddressTypes from "./Address.Types";

export const AddressModule = {
  Models: AddressModels,
  Router: AddressRouter,
  Types: {} as typeof AddressTypes,
};
