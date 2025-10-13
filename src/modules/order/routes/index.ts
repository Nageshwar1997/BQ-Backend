import { Router } from "express";
import { createOrderController, verifyPaymentController } from "../controllers";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
} from "../../../middlewares";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(createOrderController)
);

orderRouter.patch(
  "/verify-payment",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsyncWithTransaction(verifyPaymentController)
);
