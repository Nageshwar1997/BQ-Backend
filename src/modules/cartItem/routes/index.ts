import { Router } from "express";
import { AuthMiddleware, ResponseMiddleware } from "../../../middlewares";
import { addProductToCartController } from "../controllers";

export const cartProductRouter = Router();

cartProductRouter.post(
  "/add/:productId",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(addProductToCartController)
);
