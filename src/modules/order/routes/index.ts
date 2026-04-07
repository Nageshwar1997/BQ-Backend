import { Router } from "express";
import {
  cancelOrderController,
  cancelPaymentController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
} from "../controllers";
import { middlewares } from "../../../middlewares";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  middlewares.request.empty({ query: true }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatchWithSession(createOrderController),
);

orderRouter.patch(
  "/cancel-payment/:orderId",
  middlewares.request.empty({ params: true }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(cancelPaymentController),
);

orderRouter.get(
  "/",
  middlewares.request.empty({ query: false }), //LINK - Optional
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(getAllOrdersController),
);

orderRouter.get(
  "/:orderId",
  middlewares.request.empty({ params: true }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatch(getOrderByIdController),
);
orderRouter.patch(
  "/cancel/:orderId",
  middlewares.request.empty({ params: true, body: false }),
  middlewares.auth.authenticated(false),
  middlewares.response.async.tryCatchWithSession(cancelOrderController),
);
