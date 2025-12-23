import { OrderModule } from "../..";
import { IRazorPayPayment } from "../types";

export const canUpdateOrderStatus = (
  current: OrderModule.Types.IOrder["status"],
  incoming: OrderModule.Types.IOrder["status"]
) =>
  OrderModule.Constants.ORDER_STATUS_PRIORITY[incoming] >
  OrderModule.Constants.ORDER_STATUS_PRIORITY[current];

export const canUpdatePaymentStatus = (
  current: OrderModule.Types.IOrder["payment"]["status"],
  incoming: OrderModule.Types.IOrder["payment"]["status"]
) =>
  OrderModule.Constants.PAYMENT_STATUS_PRIORITY[incoming] >
  OrderModule.Constants.PAYMENT_STATUS_PRIORITY[current];

export const canUpdateRefundStatus = (
  current: string | null | undefined,
  incoming: string
) => {
  const currentPriority = current
    ? OrderModule.Constants.REFUND_STATUS_PRIORITY[current] ?? -1
    : -1;
  return (
    OrderModule.Constants.REFUND_STATUS_PRIORITY[incoming] > currentPriority
  );
};

export const getTransactionDetails = (payment: IRazorPayPayment) => {
  let transaction: OrderModule.Types.IOrder["transaction"] = {};

  switch (payment.method) {
    case "upi":
      transaction = {
        upi_rrn: payment.acquirer_data?.rrn,
        upi_transaction_id: payment.acquirer_data?.upi_transaction_id,
        upi_vpa: payment.upi?.vpa || payment.vpa || "",
        upi_flow: payment.upi?.flow,
      };
      break;
    case "card":
      transaction = {
        card_id: payment.card?.id,
        card_name: payment.card?.name,
        card_last4: payment.card?.last4,
        card_network: payment.card?.network,
        card_type: payment.card?.type,
        card_issuer: payment.card?.issuer,
        card_token_id: payment.token_id || payment.card?.token_iin || "",
        card_auth_code: payment.acquirer_data?.auth_code,
      };
      break;
    case "wallet":
      transaction = { wallet: payment.wallet || "" };
      break;
    case "netbanking":
      transaction = {
        netbanking_bank_transaction_id:
          payment.acquirer_data?.bank_transaction_id,
        netbanking_bank: payment.bank,
      };
      break;
    default:
      transaction = {};
  }

  return Object.fromEntries(Object.entries(transaction).filter(([_, v]) => v));
};

// Helper to handle payment success (captured / order.paid)
const handlePaymentSuccess = (
  update: Record<string, unknown>,
  order: OrderModule.Types.IOrder,
  payment: IRazorPayPayment,
  newPaymentStatus: OrderModule.Types.IOrder["payment"]["status"],
  newOrderStatus: OrderModule.Types.IOrder["status"]
) => {
  // Remove previous reason
  update.reason = undefined;

  if (canUpdatePaymentStatus(order.payment.status, newPaymentStatus)) {
    update["payment.status"] = newPaymentStatus;
    if (!order.payment.paid_at) {
      update["payment.paid_at"] = new Date(payment.created_at * 1000);
    }
  }

  // Generate receipt if first-time
  if (!order.payment.rzp_payment_receipt) {
    update[
      "payment.rzp_payment_receipt"
    ] = `payment_receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  if (canUpdateOrderStatus(order.status, newOrderStatus)) {
    update.status = newOrderStatus;
  }

  return update;
};

export const get_rzp_OrderUpdateBody = (
  event: string,
  payment: IRazorPayPayment,
  receivedSignature: string,
  order: OrderModule.Types.IOrder
) => {
  let update: Record<string, unknown> = {};
  const transaction = getTransactionDetails(payment);

  const paymentCommonBody = {
    "payment.rzp_payment_id": payment.id,
    "payment.rzp_signature": receivedSignature,
    "payment.method": payment.method?.toUpperCase() || "OTHER",
    ...(payment.email && { "payment.email": payment.email }),
    ...(payment.contact && { "payment.contact": payment.contact }),
    ...(payment.fee > 0 && { "payment.fee": payment.fee / 100 }),
    ...(payment.tax > 0 && { "payment.tax": payment.tax / 100 }),
    ...(Object.keys(transaction).length > 0 && { transaction }),
  };

  switch (event) {
    case "payment.captured":
      update = handlePaymentSuccess(
        update,
        order,
        payment,
        "CAPTURED",
        "PROCESSING"
      );
      break;

    case "order.paid":
      update = handlePaymentSuccess(
        update,
        order,
        payment,
        "PAID",
        "CONFIRMED"
      );
      break;

    case "payment.failed":
      update = {
        ...paymentCommonBody,
        "payment.status": "FAILED",
        status: "FAILED",
        reason: payment.error_description || "Payment failed by Razorpay",
      };
      break;

    case "refund.created":
      if (canUpdateRefundStatus(order.refund_status, "APPROVED")) {
        update = { refund_status: "APPROVED" };
      }
      break;

    case "refund.processed":
      if (canUpdateRefundStatus(order.refund_status, "REFUNDED")) {
        update = {
          refund_status: "REFUNDED",
          refunded_at: new Date(),
          "payment.status": "REFUNDED",
        };
      }
      break;

    case "refund.failed":
      if (canUpdateRefundStatus(order.refund_status, "FAILED")) {
        update = { refund_status: "FAILED" };
      }
      break;

    default:
      update = {};
  }

  // Remove undefined/null fields before DB update
  Object.keys(update).forEach(
    (key) =>
      (update[key] === undefined || update[key] === null) && delete update[key]
  );

  return update;
};
