import { Request, Response } from "express";
import crypto from "crypto";
import { RAZORPAY_WEBHOOK_SECRET } from "../../../envs";
import { AppError } from "../../../classes";
import { ChatbotModule, OrderModule } from "../..";
import { isValidMongoId } from "../../../utils";
import { IRazorPayPayment } from "./types";
import { RAZORPAY_ACTIVE_EVENTS } from "../../../constants";

const getTransactionDetails = (payment: IRazorPayPayment) => {
  let transaction: OrderModule.Types.IOrder["transaction"] = {};
  switch (payment.method) {
    case "upi": {
      const upiData = {
        upi_rrn: payment.acquirer_data?.rrn,
        upi_transaction_id: payment.acquirer_data?.upi_transaction_id,
        upi_vpa: payment.upi?.vpa || payment.vpa,
        upi_flow: payment.upi?.flow,
      };

      // Filter out keys with falsy values
      transaction = Object.fromEntries(
        Object.entries(upiData).filter(([_, value]) => value)
      );

      break;
    }

    case "card": {
      const cardData = {
        card_id: payment.card?.id,
        card_name: payment.card?.name,
        card_last4: payment.card?.last4,
        card_network: payment.card?.network,
        card_type: payment.card?.type,
        card_issuer: payment.card?.issuer,
        card_token_id: payment.token_id || payment.card?.token_iin,
        card_auth_code: payment.acquirer_data?.auth_code,
      };

      // Filter out keys with falsy values
      transaction = Object.fromEntries(
        Object.entries(cardData).filter(([_, value]) => value)
      );

      break;
    }

    case "wallet": {
      const walletData = { wallet: payment.wallet };

      // Filter out keys with falsy values
      transaction = Object.fromEntries(
        Object.entries(walletData).filter(([_, value]) => value)
      );

      break;
    }

    case "netbanking": {
      const netbankingData = {
        netbanking_bank_transaction_id:
          payment.acquirer_data?.bank_transaction_id,
        netbanking_bank: payment.bank,
      };

      // Filter out keys with falsy values
      transaction = Object.fromEntries(
        Object.entries(netbankingData).filter(([_, value]) => value)
      );

      break;
    }

    default: {
      transaction = {};
      break;
    }
  }

  return transaction;
};

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

  const transactionData = getTransactionDetails(payment);

  console.log("transactionData", transactionData);

  console.log("event", event);
  console.log("payment", payment);

  if (!payment) {
    console.log("Payment payload missing");
    throw new AppError("Payment payload missing", 400);
  }

  const orderDBId = payment?.notes?.db_order_id;
  const userId = payment?.notes?.buyer_id;

  console.log("orderDBId", orderDBId);

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
    "payment.rzp_payment_id": payment.id,
    "payment.rzp_signature": receivedSignature,
    "payment.method": payment.method?.toUpperCase() || "OTHER",
    ...(payment.email && { "payment.email": payment.email }),
    ...(payment.contact && { "payment.contact": payment.contact }),
    ...(payment.fee > 0 && {
      "payment.fee": Number(payment.fee) / 100,
    }),
    ...(payment.tax > 0 && {
      "payment.tax": Number(payment.tax) / 100,
    }),
    transaction: getTransactionDetails(payment),
  };

  let update = {};

  switch (event) {
    case "payment.captured":
      update = {
        ...paymentCommonBody,
        "payment.status": "CAPTURED",
        status: "PROCESSING",
        payment_receipt: `payment_receipt_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}`,
        "payment.paid_at": new Date(payment.created_at * 1000),
      };
      break;

    case "payment.failed":
      update = {
        ...paymentCommonBody,
        "payment.status": "FAILED",
        status: "FAILED",
        message: payment.error_description,
      };
      break;

    case "order.paid":
      update = {
        ...paymentCommonBody,
        "payment.status": "PAID",
        "payment.paid_at": new Date(payment.created_at * 1000),
        status: "CONFIRMED",
      };
      break;

    case "refund.created":
      update = { refund_status: "APPROVED" };
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

  if (Object.keys(update).length) {
    await OrderModule.Models.Order.findByIdAndUpdate(orderDBId, {
      $set: update,
    });
  }

  res.success(200, "Webhook processed successfully");

  // 🔁 Async chatbot sync
  setImmediate(async () => {
    if (RAZORPAY_ACTIVE_EVENTS.includes(event)) {
      await ChatbotModule.Services.createOrUpdateEmbeddedOrder({ order });
    }
  });
};
