import { Router } from "express";
import {
  cancelOrderController,
  cancelPaymentController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
} from "../controllers";
import { Middlewares } from "../../../Middlewares";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  Middlewares.Request.Empty({ query: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatchWithSession(createOrderController),
);

orderRouter.patch(
  "/cancel-payment/:orderId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(cancelPaymentController),
);

orderRouter.get(
  "/",
  Middlewares.Request.Empty({ query: false }), //LINK - Optional
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(getAllOrdersController),
);

orderRouter.get(
  "/:orderId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatch(getOrderByIdController),
);
orderRouter.patch(
  "/cancel/:orderId",
  Middlewares.Request.Empty({ params: true, body: false }),
  Middlewares.Auth.Authenticated(false),
  Middlewares.Response.Async.TryCatchWithSession(cancelOrderController),
);
