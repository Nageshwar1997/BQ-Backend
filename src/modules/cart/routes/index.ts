import { Router } from "express";
import { middlewares } from "../../../middlewares";
import { clearCartController, getCartController } from "../controllers";

export const cartRouter = Router();

cartRouter.get(
  "/",
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(getCartController),
);

cartRouter.patch(
  "/clear",
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatchWithSession(clearCartController),
);
