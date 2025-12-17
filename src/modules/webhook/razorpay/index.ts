import { Request, Response } from "express";
import crypto from "crypto";
import { RAZORPAY_WEBHOOK_SECRET } from "../../../envs";
import { AppError } from "../../../classes";
import { ChatbotModule, OrderModule } from "../..";
import { isValidMongoId } from "../../../utils";

/**
 * 🔥 Remove all previous payment method details
 * This ensures only latest payment method data exists
 */
const getPaymentMethodUnsetPayload = () => ({
  "payment.details.upi": 1,
  "payment.details.netbanking": 1,
  "payment.details.card": 1,
  "payment.details.wallet": 1,
});

export const razorpayWebhooksController = async (
  req: Request,
  res: Response
) => {
  const { body } = req;
  const secret = RAZORPAY_WEBHOOK_SECRET!;

  // 🔐 Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  const receivedSignature = req.headers["x-razorpay-signature"];

  if (expectedSignature !== receivedSignature) {
    console.log("expectedSignature", expectedSignature);
    console.log("receivedSignature", receivedSignature);
    console.log("Invalid signature");
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = body.event;
  const payment = body?.payload?.payment?.entity;

  if (!payment) {
    console.log("Payment payload missing");
    throw new AppError("Payment payload missing", 400);
  }

  const orderDBId = payment?.notes?.db_order_id;
  const userId = payment?.notes?.buyer_id;

  isValidMongoId(orderDBId, "Invalid order id in notes", 400);
  isValidMongoId(userId, "Invalid user id in notes", 400);

  const order = await OrderModule.Models.Order.findById(orderDBId);
  if (!order) {
    console.log("Order not found");
    throw new AppError("Order not found", 404);
  }

  /**
   * 🔁 Common payment payload
   */
  const paymentCommonBody = {
    "payment.razorpay.payment_id": payment.id,
    "payment.razorpay.signature": receivedSignature,

    "payment.details.method": payment.method?.toUpperCase() || "OTHER",
    ...(payment.email && { "payment.details.email": payment.email }),
    ...(payment.contact && { "payment.details.contact": payment.contact }),
    ...(payment.fee > 0 && {
      "payment.details.fee": Number(payment.fee) / 100,
    }),
    ...(payment.tax > 0 && {
      "payment.details.tax": Number(payment.tax) / 100,
    }),
    ...((payment.vpa || payment.upi) && {
      "payment.details": {
        ...order.payment.details,
        upi: {
          rrn: payment.acquirer_data?.rrn,
          upi_transaction_id: payment.acquirer_data?.upi_transaction_id,
          vpa: payment.vpa || payment.upi?.vpa,
          flow: payment.upi?.flow,
        },
      },
    }),
    ...((payment.acquirer_data?.bank_transaction_id || payment.bank) && {
      "payment.details": {
        ...order.payment.details,
        netbanking: {
          bank_transaction_id: payment.acquirer_data?.bank_transaction_id,
          bank: payment.bank,
        },
      },
    }),
    ...(payment.card && {
      "payment.details": {
        ...order.payment.details,
        card: {
          id: payment.card.id,
          name: payment.card.name,
          last4: payment.card.last4,
          network: payment.card.network,
          type: payment.card.type,
          issuer: payment.card.issuer,
          token_id: payment.token_id || payment.card?.token_iin,
          auth_code: payment.acquirer_data?.auth_code,
        },
      },
    }),
  };

  let update = {};
  let unset = {};

  switch (event) {
    /**
     * ✅ FINAL SUCCESS EVENT
     */
    case "payment.captured":
      if (order.payment.status === "UNPAID") {
        unset = getPaymentMethodUnsetPayload();

        update = {
          ...paymentCommonBody,
          "payment.status": "PAID",
          status: "PROCESSING",
          payment_receipt: `payment_receipt_${Date.now()}`,
          "payment.paid_at": new Date(payment.created_at * 1000),
        };
      }
      break;

    /**
     * ❌ Payment failed (DON'T UNSET)
     * Retry allowed
     */
    case "payment.failed":
      if (order.payment.status === "UNPAID") {
        update = {
          ...paymentCommonBody,
          "payment.status": "FAILED",
          status: "FAILED",
          message: payment.error_description,
        };
      }
      break;

    /**
     * ✅ Safety net (order.paid)
     */
    case "order.paid":
      if (order.payment.status !== "PAID") {
        unset = getPaymentMethodUnsetPayload();

        update = {
          ...paymentCommonBody,
          "payment.status": "PAID",
          "payment.paid_at": new Date(payment.created_at * 1000),
          status: "CONFIRMED",
        };
      }
      break;

    /**
     * 🔁 Refund lifecycle
     */
    case "refund.created":
      // Skip if already refunded
      if (order.payment.status !== "REFUNDED") {
        update = { refund_status: "APPROVED" };
      }
      break;

    case "refund.processed":
      update = {
        refund_status: "REFUNDED",
        refunded_at: new Date(),
      };
      break;

    case "refund.failed":
      update = { refund_status: "FAILED" };
      break;

    default:
      return res.success(200, "Event ignored");
  }

  if (Object.keys(update).length || Object.keys(unset).length) {
    await OrderModule.Models.Order.findByIdAndUpdate(
      orderDBId,
      {
        ...(Object.keys(unset).length && { $unset: unset }),
        ...(Object.keys(update).length && { $set: update }),
      }
      // { new: true }
    );
  }

  res.success(200, "Webhook processed successfully");

  // 🔁 Async chatbot sync
  setImmediate(async () => {
    await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
  });
};
