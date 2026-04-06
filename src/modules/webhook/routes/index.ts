import { raw, Router } from "express";
import { ResponseMiddleware } from "../../../Middlewares";
import { razorpayWebhooksController } from "../razorpay";

export const webhookRouter = Router();

webhookRouter.use(
  "/razorpay",
  raw({ type: "application/json" }), //NOTE - To parse the raw json
  ResponseMiddleware.catchAsync(razorpayWebhooksController),
);
