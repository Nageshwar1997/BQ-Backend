import { Types } from "mongoose";
import { getEmbeddings, postEmbeddings } from "../../../configs";
import { EmbeddedOrder } from "../models";
import { IAggregatedEmbeddedOrder } from "../types";

export const getEmbeddedOrders = async (
  message: string,
  userId: string
): Promise<IAggregatedEmbeddedOrder[]> => {
  const queryVector = await getEmbeddings.embedQuery(message);

  const orders = await EmbeddedOrder.aggregate([
    {
      $vectorSearch: {
        index: "vector_order_index",
        queryVector,
        path: "embeddings",
        numCandidates: 100,
        limit: 5,
      },
    },
    {
      $match: { user: new Types.ObjectId(userId) },
    },

    // populate order
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },

    // unwind products
    {
      $unwind: {
        path: "$order.products",
        preserveNullAndEmptyArrays: true,
      },
    },

    // lookup product title only
    {
      $lookup: {
        from: "products",
        let: { productId: "$order.products.product" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
          { $project: { _id: 0, title: 1 } }, // only title
        ],
        as: "order.products.product",
      },
    },
    {
      $unwind: {
        path: "$order.products.product",
        preserveNullAndEmptyArrays: true,
      },
    },

    // lookup shadeName only (can be null)
    {
      $lookup: {
        from: "shades",
        let: { shadeId: "$order.products.shade" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$shadeId"] } } },
          { $project: { _id: 0, shadeName: 1 } }, // only shadeName
        ],
        as: "order.products.shade",
      },
    },
    {
      $unwind: {
        path: "$order.products.shade",
        preserveNullAndEmptyArrays: true,
      },
    },

    // rebuild products array with only required fields
    {
      $group: {
        _id: "$_id",
        embeddings: { $first: "$embeddings" },
        user: { $first: "$user" },
        order: { $first: "$order" },
        products: {
          $push: {
            product: "$order.products.product",
            shade: "$order.products.shade",
            quantity: "$order.products.quantity",
            createdAt: "$order.products.createdAt",
            updatedAt: "$order.products.updatedAt",
          },
        },
      },
    },

    // attach cleaned products array back to order
    {
      $addFields: {
        "order.products": "$products",
      },
    },
    { $project: { products: 0 } }, // remove temporary array
  ]);

  return orders;
};

export const getMinimalOrdersForAiPrompt = (
  orders: IAggregatedEmbeddedOrder[]
) => {
  const minimalOrders = orders?.map(({ order }, i) => ({
    "Order Id": order._id,
    "Shipping Address":
      "City:- " +
      (order.addresses.both?.city ?? order.addresses.shipping?.city) +
      ", " +
      "State:- " +
      (order.addresses.both?.state ?? order.addresses.shipping?.state),
    "Created At": order.createdAt,
    ...(order.order_result.cancelled_at && {
      "Cancelled  At": order.order_result.cancelled_at,
    }),
    ...(order.razorpay_payment_result?.rzp_payment_status === "PAID" &&
      order.order_result?.order_status === "CONFIRMED" && {
        "Expected Delivery": new Date(
          (order.order_result.paid_at?.getTime() || Date.now()) +
            7 * 24 * 60 * 60 * 1000
        ),
      }),
    "Order  At": order.order_result.cancelled_at,
    "Payment Status": order.razorpay_payment_result.rzp_payment_status,
    "Payment Mode": order.razorpay_payment_result.payment_mode,
    "Total Amount": order.order_result.price,
    Discount: order.order_result.discount,
    Charges: order.order_result.charges,
    "Customer Email": order.payment_details?.email,
    "Customer Contact": order.payment_details?.contact,
    Products: order.products.forEach((product) => {
      return {
        "Product Title": product.product.title,
        ...(product.shade?.shadeName && {
          "Shade Name": product.shade?.shadeName,
        }),
        Quantity: product.quantity,
      };
    }),
  }));

  return minimalOrders;
};

export const createOrUpdateEmbeddedOrder = async ({
  order,
}: {
  order: IAggregatedEmbeddedOrder["order"];
}) => {
  const searchText = JSON.stringify({
    "Order No.": 1,
    "Order ID": order._id,
    "User Id": order.user?._id || order.user,
    "Order Status": order.order_result.order_status,
    ...(order.razorpay_payment_result?.rzp_payment_status === "PAID" &&
      order.order_result?.order_status === "CONFIRMED" && {
        "Expected Delivery": new Date(
          (order.order_result.paid_at?.getTime() || Date.now()) +
            7 * 24 * 60 * 60 * 1000
        ),
      }),
    "Payment Status": order.razorpay_payment_result.rzp_payment_status,
    "Payment Mode": order.razorpay_payment_result.payment_mode,
    "Total Amount": order.order_result.price,
    Discount: order.order_result.discount,
    Charges: order.order_result.charges,
    "Customer Email": order.payment_details?.email,
    "Customer Contact": order.payment_details?.contact,
    "Shipping Address":
      "City:- " +
      (order.addresses.both?.city ?? order.addresses.shipping?.city) +
      ", " +
      "State:- " +
      (order.addresses.both?.state ?? order.addresses.shipping?.state),
  });

  try {
    const embeddings = await postEmbeddings.embedQuery(searchText);

    await EmbeddedOrder.findOneAndUpdate(
      { order: order._id, user: order.user?._id || order.user },
      { $set: { embeddings, searchText } },
      { new: true, upsert: true }
    );

    console.log("Background order embedding done");
  } catch (err) {
    console.error("Background order embedding failed:", err);
  }
};
