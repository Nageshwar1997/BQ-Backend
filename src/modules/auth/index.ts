import { authRouter } from "./routes";
import { authServices } from "./services";

export * as Types from "./types";
export * as Routes from "./routes";
export * as Utils from "./utils";

export const AuthModule = {
  Router: authRouter,
  Services: authServices,
};
