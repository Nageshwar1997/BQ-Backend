import { authRouter } from "./Auth.Routes";
import { AuthServices } from "./Auth.Services";
import { authUtils } from "./Auth.Utils";

export const AuthModule = {
  Router: authRouter,
  Services: AuthServices,
  Utils: authUtils,
};
