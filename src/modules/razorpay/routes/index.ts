import { raw, Router } from "express";
import { ResponseMiddleware } from "../../../middlewares";
import { verifyPaymentController } from "../controllers";

export const razorpayRouter = Router();

razorpayRouter.post(
  "/verify-payment",
  raw({ type: "application/json" }),
  ResponseMiddleware.catchAsyncWithTransaction(verifyPaymentController)
);
