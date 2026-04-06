import { raw, Router } from "express";
import { Middlewares } from "../../../Middlewares";
import { razorpayWebhooksController } from "../razorpay";

export const webhookRouter = Router();

webhookRouter.use(
  "/razorpay",
  raw({ type: "application/json" }), //NOTE - To parse the raw json
  Middlewares.Response.Async.TryCatch(razorpayWebhooksController),
);
