import { raw, Router } from "express";
import { ResponseMiddleware } from "../../../middlewares";
import { razorpayWebhooksController } from "../razorpay";

export const webhookRouter = Router();

webhookRouter.use(
  "/razorpay",
  raw({ type: "application/json" }), //NOTE - To parse the raw json
  ResponseMiddleware.catchAsyncWithTransaction(razorpayWebhooksController)
);
