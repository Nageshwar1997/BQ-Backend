import { Router } from "express";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { addProductToCartController } from "../controllers";
import { updateCartProductQuantityZodSchema } from "../validations";
import { updateCartProductQuantityController } from "../controllers/updateCartProductQuantity";

export const cartProductRouter = Router();

cartProductRouter.post(
  "/add/:productId",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(addProductToCartController)
);

cartProductRouter.patch(
  "/update/:id",
  AuthMiddleware.authenticated,
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(updateCartProductQuantityZodSchema),
  ResponseMiddleware.catchAsync(updateCartProductQuantityController)
);
