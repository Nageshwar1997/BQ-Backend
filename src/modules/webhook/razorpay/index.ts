import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { ClientSession } from "mongoose";
import { RAZORPAY_WEBHOOK_SECRET } from "../../../envs";
import { AppError } from "../../../classes";
import { ChatbotModule, OrderModule } from "../..";
import { isValidMongoId } from "../../../utils";

export const razorpayWebhooksController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
  session: ClientSession
) => {
  const { body } = req;
  const secret = RAZORPAY_WEBHOOK_SECRET!;

  const expected_signature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  const rzp_signature = req.headers["x-razorpay-signature"];

  if (expected_signature !== rzp_signature) {
    console.error("Invalid signature");
    throw new AppError("Invalid signature", 400);
  }
  const payment = req.body.payload.payment.entity;

  try {
    const event = body.event;
    if (
      [
        "payment.captured",
        "payment.failed",
        // "order.paid" // NOTE - I'm capturing whole payment in one time, so I don't need to use this
      ].includes(event)
    ) {
      const orderDBId = payment?.notes?.db_order_id;
      const userId = payment?.notes?.buyer_id;

      isValidMongoId(orderDBId, "Invalid order id get from notes", 400);
      isValidMongoId(userId, "Invalid user id get from notes", 400);

      const paymentCommonBody = {
        "razorpay_payment_result.rzp_payment_id": payment.id,
        "razorpay_payment_result.rzp_signature": rzp_signature,
        "payment_details.method": payment.method?.toUpperCase() || "OTHER",
        ...(payment.bank && {
          "payment_details.bank": payment.bank,
        }),
        ...(payment.wallet && {
          "payment_details.wallet": payment.wallet,
        }),
        ...(payment.email && {
          "payment_details.email": payment.email,
        }),
        ...(payment.contact && {
          "payment_details.contact": payment.contact,
        }),
        ...(payment.fee && {
          "payment_details.fee": Number(payment.fee) / 100,
        }),
        ...(payment.tax && {
          "payment_details.tax": Number(payment.tax) / 100,
        }),
        ...((payment.vpa || payment.upi) && {
          "payment_details.upi": {
            acquirer_data: {
              ...(payment.acquirer_data && {
                rrn: payment.acquirer_data.rrn,
                upi_transaction_id: payment.acquirer_data.upi_transaction_id,
              }),
              vpa: payment.vpa || payment.upi?.vpa,
              flow: payment.upi?.flow,
            },
          },
        }),
        ...(payment.acquirer_data?.bank_transaction_id && {
          "payment_details.netbanking": {
            acquirer_data: {
              bank_transaction_id: payment.acquirer_data.bank_transaction_id,
            },
          },
        }),
        ...((payment.token_id || payment.card || payment.acquirer_data) && {
          "payment_details.card": {
            ...((payment.token_id || payment.card?.token_iin) && {
              token_id: payment.token_id || payment.card?.token_iin,
            }),
            ...(payment.acquirer_data?.auth_code && {
              acquirer_data: {
                auth_code: payment.acquirer_data.auth_code,
              },
            }),
            ...(payment.card &&
              Object.keys(payment.card).length > 0 && {
                card: Object.fromEntries(
                  Object.entries(payment.card).filter(([_, value]) => !!value)
                ),
              }),
          },
        }),
      };

      const paymentCapturedBody = {
        // "razorpay_payment_result.rzp_order_id": payment.order_id, //LINK - No need to set rzp_order_id as it's already set create order api
        ...paymentCommonBody,
        "razorpay_payment_result.rzp_payment_status": "PAID",
        "order_result.order_status": "PROCESSING",
        "order_result.paid_at": new Date(payment.created_at * 1000),
        "order_result.payment_receipt": `payment_receipt_${Date.now()}`,
        // ...(payment.refund_status && {
        //   "payment_details.refund_status": payment.refund_status,
        // }), //STUB - It will come in refund event
      };

      const paymentFailedBody = {
        ...paymentCommonBody,
        "razorpay_payment_result.rzp_payment_status": "FAILED",
        "order_result.order_status": "FAILED",
      };

      const orderPaidBody = {
        "order_result.order_status": "CONFIRMED",
      };

      const refundCreatedBody = {
        "razorpay_refund_result.rzp_refund_status": "APPROVED",
        "order_result.order_status": "CANCELLED",
      };

      const refundProcessedBody = {
        "razorpay_refund_result.rzp_refund_status": "REFUNDED",
        "order_result.order_status": "CANCELLED",
      };

      const order = await OrderModule.Models.Order.findByIdAndUpdate(
        orderDBId,
        {
          $set: {},
        },
        { new: true, session }
      );

      if (!order) throw new AppError("Order not found", 404);

      res.success(200, "Payment verified successfully", { status: "ok" });

      // Create embedded order in chatbot (Background task)
      (async () => {
        await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
      })();
    } else if (event === "order.paid") {
      console.log("payment", payment);
      console.log("event", event);
    } else if (event === "refund.created") {
      console.log("payment", payment);
      console.log("event", event);
    } else if (event === "refund.processed") {
      console.log("payment", payment);
      console.log("event", event);
    } else if (event === "refund.failed") {
      console.log("payment", payment);
      console.log("event", event);
    } else {
      throw new AppError("Payment not found", 404);
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Failed to update payment status.",
      500
    );
  }
};
