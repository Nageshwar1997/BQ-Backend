import { Router } from "express";
import { AuthMiddleware, ResponseMiddleware } from "../../../middlewares";
import { getCartController } from "../controllers";

export const cartRouter = Router();

cartRouter.get(
  "/cart",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getCartController)
);
