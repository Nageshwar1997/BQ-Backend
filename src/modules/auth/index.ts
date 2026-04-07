import { authRouter } from "./routes";
import { authServices } from "./services";
import { authUtils } from "./utils";

export const authModule = {
  router: authRouter,
  services: authServices,
  utils: authUtils,
};
