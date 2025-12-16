import { Router } from "express";
import { AuthMiddleware, ResponseMiddleware } from "../../../middlewares";
import { clearCartController, getCartController } from "../controllers";

export const cartRouter = Router();

cartRouter.get(
  "/cart",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getCartController)
);

cartRouter.patch(
  "/clear",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsyncWithTransaction(clearCartController)
);
