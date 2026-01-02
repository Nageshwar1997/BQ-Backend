import { Router } from "express";
import {
  cancelOrderController,
  cancelPaymentController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
} from "../controllers";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
} from "../../../middlewares";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  RequestMiddleware.checkEmptyRequest({ query: true }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(createOrderController)
);

orderRouter.patch(
  "/cancel-payment/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(cancelPaymentController)
);

orderRouter.get(
  "/",
  RequestMiddleware.checkEmptyRequest({ query: false }), //LINK - Optional
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(getAllOrdersController)
);

orderRouter.get(
  "/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsync(getOrderByIdController)
);
orderRouter.patch(
  "/cancel/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true, body: false }),
  AuthMiddleware.authenticated(false),
  ResponseMiddleware.catchAsyncWithTransaction(cancelOrderController)
);
