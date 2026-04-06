import { Router } from "express";
import { Middlewares } from "../../../Middlewares";
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
  Middlewares.Response.Async.TryCatchWithSession(addProductToCartController),
);

cartProductRouter.patch(
  "/update/:id",
  Middlewares.Request.Empty({ body: true, params: true }),
  Middlewares.Zod(updateCartProductQuantityZodSchema),
  Middlewares.Response.Async.TryCatch(updateCartProductQuantityController),
);

cartProductRouter.delete(
  "/remove/:id",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Response.Async.TryCatchWithSession(
    removeProductFromCartController,
  ),
);
