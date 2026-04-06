import { Router } from "express";
import {
  Middlewares,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../Middlewares";
import {
  addProductToCartController,
  removeProductFromCartController,
  updateCartProductQuantityController,
} from "../controllers";
import { updateCartProductQuantityZodSchema } from "../validations";

export const cartProductRouter = Router();

cartProductRouter.use(Middlewares.Auth.Authenticated(false));

cartProductRouter.post(
  "/add/:productId",
  Middlewares.Request.Empty({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(addProductToCartController),
);

cartProductRouter.patch(
  "/update/:id",
  Middlewares.Request.Empty({ body: true, params: true }),
  ZodMiddleware.validateZodSchema(updateCartProductQuantityZodSchema),
  ResponseMiddleware.catchAsync(updateCartProductQuantityController),
);

cartProductRouter.delete(
  "/remove/:id",
  Middlewares.Request.Empty({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(removeProductFromCartController),
);
