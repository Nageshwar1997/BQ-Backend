import { raw, Router } from "express";
import { RazorpayModule } from "../..";

export const webhookRouter = Router();

webhookRouter.use(
  "/razorpay",
  raw({ type: "application/json" }), //NOTE - To parse the raw json
  RazorpayModule.Routes.razorpayRouter
);
