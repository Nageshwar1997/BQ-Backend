import { Router } from "express";
import {
  cancelOrderController,
  cancelPaymentController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
} from "../controllers";
import {
  Middlewares,
  RequestMiddleware,
  ResponseMiddleware,
} from "../../../Middleware";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  RequestMiddleware.checkEmptyRequest({ query: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(createOrderController),
);

orderRouter.patch(
  "/cancel-payment/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(cancelPaymentController),
);

orderRouter.get(
  "/",
  RequestMiddleware.checkEmptyRequest({ query: false }), //LINK - Optional
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(getAllOrdersController),
);

orderRouter.get(
  "/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsync(getOrderByIdController),
);
orderRouter.patch(
  "/cancel/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true, body: false }),
  Middlewares.Auth.Authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(cancelOrderController),
);
