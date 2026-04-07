import { addressModels } from "./models";
import { addressRouter } from "./routes";

export * as TAddressModule from "./types";

export const addressModule = {
  models: addressModels,
  router: addressRouter,
};
