import { getEmbeddings, postEmbeddings } from "../../../configs";
import { EmbeddedOrder } from "../models";
import { IAggregatedEmbeddedOrder } from "../types";

export const getEmbeddedOrders = async (
  message: string
): Promise<IAggregatedEmbeddedOrder[]> => {
  const queryVector = await getEmbeddings.embedQuery(message);

  const orders = await EmbeddedOrder.aggregate([
    // Vector search
    {
      $vectorSearch: {
        index: "vector_order_index",
        queryVector,
        path: "embeddings",
        numCandidates: 100,
        limit: 5,
      },
    },
  ]);

  const cleanedOrders = orders.map((item) => {
    return {
      ...item,
      order: {
        ...item.order,
      },
    };
  });

  return cleanedOrders;
};

export const getMinimalOrdersForAiPrompt = (
  orders: IAggregatedEmbeddedOrder[]
) => {
  const minimalOrders = orders?.map(
    (
      _,
      // { order }
      i
    ) => ({
      "Order No.": i + 1,
    })
  );

  return minimalOrders;
};

export const createOrUpdateEmbeddedOrder = async ({
  orderId,
}: {
  orderId: string;
}) => {
  try {
    const searchText = ``;
    const embeddings = await postEmbeddings.embedQuery(searchText);

    await EmbeddedOrder.findOneAndUpdate(
      { order: orderId },
      { $set: { embeddings, searchText } },
      { new: true, upsert: true }
    );

    console.log("Background order embedding done");
  } catch (err) {
    console.error("Background order embedding failed:", err);
  }
};
