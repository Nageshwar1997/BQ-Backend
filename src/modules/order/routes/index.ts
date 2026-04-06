import { Router } from "express";
import {
  cancelOrderController,
  cancelPaymentController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
} from "../controllers";
import { Middlewares, ResponseMiddleware } from "../../../Middlewares";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  Middlewares.Request.Empty({ query: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(createOrderController),
);

orderRouter.patch(
  "/cancel-payment/:orderId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(cancelPaymentController),
);

orderRouter.get(
  "/",
  Middlewares.Request.Empty({ query: false }), //LINK - Optional
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(getAllOrdersController),
);

orderRouter.get(
  "/:orderId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(getOrderByIdController),
);
orderRouter.patch(
  "/cancel/:orderId",
  Middlewares.Request.Empty({ params: true, body: false }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(cancelOrderController),
);
