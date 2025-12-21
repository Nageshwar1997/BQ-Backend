import { OrderModule } from "../../..";
import {
  ORDER_STATUS_PRIORITY,
  PAYMENT_STATUS_PRIORITY,
  REFUND_STATUS_PRIORITY,
} from "../../../order/constants";
import { IRazorPayPayment } from "../types";

export const canUpdateOrderStatus = (
  current: OrderModule.Types.IOrder["status"],
  incoming: OrderModule.Types.IOrder["status"]
) => {
  return ORDER_STATUS_PRIORITY[incoming] > ORDER_STATUS_PRIORITY[current];
};

export const canUpdatePaymentStatus = (
  current: OrderModule.Types.IOrder["payment"]["status"],
  incoming: OrderModule.Types.IOrder["payment"]["status"]
) => {
  return PAYMENT_STATUS_PRIORITY[incoming] > PAYMENT_STATUS_PRIORITY[current];
};

export const canUpdateRefundStatus = (
  current: string | null | undefined,
  incoming: string
) => {
  const currentPriority = current ? REFUND_STATUS_PRIORITY[current] ?? -1 : -1;
  return REFUND_STATUS_PRIORITY[incoming] > currentPriority;
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
      break;
  }

  return Object.fromEntries(Object.entries(transaction).filter(([_, v]) => v));
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
    case "payment.captured": {
      update = { ...paymentCommonBody };

      if (canUpdatePaymentStatus(order.payment.status, "CAPTURED")) {
        update["payment.status"] = "CAPTURED";
        if (!order.payment.paid_at) {
          update["payment.paid_at"] = new Date(payment.created_at * 1000);
        }
      }

      // Generate receipt only if not exists
      if (!order.payment.rzp_payment_receipt) {
        update[
          "payment.rzp_payment_receipt"
        ] = `payment_receipt_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}`;
      }

      if (canUpdateOrderStatus(order.status, "PROCESSING")) {
        update.status = "PROCESSING";
      }
      break;
    }

    case "payment.failed": {
      update = {
        ...paymentCommonBody,
        "payment.status": "FAILED",
        status: "FAILED",
        message: payment.error_description,
      };
      break;
    }

    case "order.paid": {
      update = { ...paymentCommonBody };

      if (canUpdatePaymentStatus(order.payment.status, "PAID")) {
        update["payment.status"] = "PAID";
        if (!order.payment.paid_at) {
          update["payment.paid_at"] = new Date(payment.created_at * 1000);
        }
      }

      // Generate payment receipt if first-time
      if (!order.payment.rzp_payment_receipt) {
        update[
          "payment.rzp_payment_receipt"
        ] = `payment_receipt_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}`;
      }

      if (canUpdateOrderStatus(order.status, "CONFIRMED")) {
        update.status = "CONFIRMED";
      }
      break;
    }

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

  return update;
};
