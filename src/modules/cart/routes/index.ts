import { Router } from "express";
import { Middlewares } from "../../../Middlewares";
import { clearCartController, getCartController } from "../controllers";

export const cartRouter = Router();

cartRouter.get(
  "/",
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(getCartController),
);

cartRouter.patch(
  "/clear",
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatchWithSession(clearCartController),
);
