import { Router } from "express";
import { Middlewares, ResponseMiddleware } from "../../../middlewares";
import { clearCartController, getCartController } from "../controllers";

export const cartRouter = Router();

cartRouter.get(
  "/",
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(getCartController),
);

cartRouter.patch(
  "/clear",
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(clearCartController),
);
