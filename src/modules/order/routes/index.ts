import { Router } from "express";
import {
  cancelOrderController,
  cancelPaymentController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  verifyPaymentController,
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
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(createOrderController)
);

orderRouter.patch(
  "/verify-payment",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsyncWithTransaction(verifyPaymentController)
);

orderRouter.patch(
  "/cancel-payment/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(cancelPaymentController)
);

orderRouter.get(
  "/",
  RequestMiddleware.checkEmptyRequest({ query: false }), //LINK - Optional
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getAllOrdersController)
);

orderRouter.get(
  "/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getOrderByIdController)
);
orderRouter.patch(
  "/cancel/:orderId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsyncWithTransaction(cancelOrderController)
);
