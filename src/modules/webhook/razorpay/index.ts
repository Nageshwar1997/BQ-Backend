import { Request, Response } from "express";
import crypto from "crypto";
import { RAZORPAY_WEBHOOK_SECRET } from "../../../envs";
import { AppError } from "../../../classes";
import { ChatbotModule, OrderModule } from "../..";
import { isValidMongoId } from "../../../utils";

export const razorpayWebhooksController = async (
  req: Request,
  res: Response
) => {
  const { body } = req;
  const secret = RAZORPAY_WEBHOOK_SECRET!;

  // Verify signature
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

    const orderDBId = payment?.notes?.db_order_id;
    const userId = payment?.notes?.buyer_id;

    isValidMongoId(orderDBId, "Invalid order id in notes", 400);
    isValidMongoId(userId, "Invalid user id in notes", 400);

    console.log(
      "Object.values(payment.card)",
      Object.values(payment.card ?? {})
    );
    console.log(
      "Object.entries(payment.card)",
      Object.entries(payment.card ?? {})
    );

    // Build common payment details
    const paymentCommonBody = {
      "payment.razorpay.payment_id": payment.id,
      "razorpay_payment_result.rzp_signature": rzp_signature,
      "payment_details.method": payment.method?.toUpperCase() || "OTHER",
      ...(payment.bank && { "payment_details.bank": payment.bank }),
      ...(payment.wallet && { "payment_details.wallet": payment.wallet }),
      ...(payment.email && { "payment_details.email": payment.email }),
      ...(payment.contact && { "payment_details.contact": payment.contact }),
      ...(payment.fee && { "payment_details.fee": Number(payment.fee) / 100 }),
      ...(payment.tax && { "payment_details.tax": Number(payment.tax) / 100 }),
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
      ...((payment.token_id || (payment.card && payment.acquirer_data)) && {
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
            Object.values(payment.card).length > 0 && {
              card: Object.fromEntries(
                Object.entries(payment.card).filter(([_, value]) => !!value)
              ),
            }),
        },
      }),
    };

    // Fetch order first for idempotent updates
    const order = await OrderModule.Models.Order.findById(orderDBId);
    if (!order) throw new AppError("Order not found", 404);

    let updatePayload = {};

    console.log(event + " :", payment);
    switch (event) {
      // *NOTE - Working Fine
      case "payment.captured":
        if (
          ["UNPAID"].includes(order.razorpay_payment_result.rzp_payment_status)
        ) {
          updatePayload = {
            ...paymentCommonBody,
            "razorpay_payment_result.rzp_payment_status": "PAID",
            "order_result.order_status": "PROCESSING",
            "order_result.payment_receipt": `payment_receipt_${Date.now()}`,
          };
        }
        break;
      // *NOTE - Working Fine
      case "payment.failed":
        if (
          ["UNPAID"].includes(
            order.razorpay_payment_result.rzp_payment_status
          ) &&
          ["PENDING"].includes(order.order_result.order_status)
        ) {
          console.log("HELLO TRIGGERED");
          updatePayload = {
            ...paymentCommonBody,
            "razorpay_payment_result.rzp_payment_status": "FAILED",
            "order_result.order_status": "FAILED",
            message: payment.error_description,
          };
        }
        break;

      // *NOTE - Working Fine
      case "order.paid":
        // Todo:- mesg dlt
        // Only confirm if order is not already cancelled or refunded
        if (
          ["PENDING", "FAILED", "PROCESSING"].includes(
            order.order_result?.order_status
          )
        ) {
          updatePayload = {
            ...paymentCommonBody,
            "order_result.order_status": "CONFIRMED",
            "order_result.paid_at": new Date(payment.created_at * 1000),
            // NEw
            "razorpay_payment_result.rzp_payment_status": "PAID",
            ...(!!order.order_result.payment_receipt && {
              "order_result.payment_receipt": `payment_receipt_${Date.now()}`,
            }),
          };
        }
        break;
      case "refund.created":
        // Skip if already refunded
        if (order.razorpay_payment_result.rzp_payment_status !== "REFUNDED") {
          updatePayload = { "payment_details.refund_status": "APPROVED" };
        }
        break;

      case "refund.processed":
        updatePayload = { "payment_details.refund_status": "REFUNDED" };
        break;

      case "refund.failed":
        updatePayload = { "payment_details.refund_status": "FAILED" };
        break;

      default:
        throw new AppError("Payment event not supported", 404);
    }

    // Update only if there is something to update
    if (Object.keys(updatePayload).length > 0) {
      await OrderModule.Models.Order.findByIdAndUpdate(
        orderDBId,
        { $set: updatePayload },
        { new: true }
      );
    }

    res.success(200, "Payment verified successfully", { status: "ok" });

    // Update embedded order in chatbot (Background task)
    (async () => {
      await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
    })();
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
