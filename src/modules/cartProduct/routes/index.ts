import { Router } from "express";
import { middlewares } from "../../../middlewares";
import {
  addProductToCartController,
  removeProductFromCartController,
  updateCartProductQuantityController,
} from "../controllers";
import { updateCartProductQuantityZodSchema } from "../validations";

export const cartProductRouter = Router();

cartProductRouter.use(middlewares.auth.authenticated(false));

cartProductRouter.post(
  "/add/:productId",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatchWithSession(addProductToCartController),
);

cartProductRouter.patch(
  "/update/:id",
  middlewares.request.empty({ body: true, params: true }),
  middlewares.zod(updateCartProductQuantityZodSchema),
  middlewares.response.async.tryCatch(updateCartProductQuantityController),
);

cartProductRouter.delete(
  "/remove/:id",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatchWithSession(
    removeProductFromCartController,
  ),
);
