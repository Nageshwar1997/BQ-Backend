import { Router } from "express";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import {
  addProductToCartController,
  removeProductFromCartController,
  updateCartProductQuantityController,
} from "../controllers";
import { updateCartProductQuantityZodSchema } from "../validations";

export const cartProductRouter = Router();

cartProductRouter.use(AuthMiddleware.authenticated(false));

cartProductRouter.post(
  "/add/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(addProductToCartController)
);

cartProductRouter.patch(
  "/update/:id",
  RequestMiddleware.checkEmptyRequest({ body: true, params: true }),
  ZodMiddleware.validateZodSchema(updateCartProductQuantityZodSchema),
  ResponseMiddleware.catchAsync(updateCartProductQuantityController)
);

cartProductRouter.delete(
  "/remove/:id",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(removeProductFromCartController)
);
