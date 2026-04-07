import { raw, Router } from "express";
import { middlewares } from "../../../middlewares";
import { razorpayWebhooksController } from "../razorpay";

export const webhookRouter = Router();

webhookRouter.use(
  "/razorpay",
  raw({ type: "application/json" }), //NOTE - To parse the raw json
  middlewares.response.async.tryCatch(razorpayWebhooksController),
);
