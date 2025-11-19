import { Namespace } from "socket.io";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  initChatModel,
} from "langchain";
import { getEmbeddings } from "../../../configs";
import { EmbeddedProduct } from "../models";
import { IPopulatedEmbeddedProduct } from "../types";

interface ChatSession {
  history: (SystemMessage | HumanMessage | AIMessage)[];
  lastMatchedProducts?: IPopulatedEmbeddedProduct[];
  lastQuery?: string;
}

const chatHistory = new Map<string, ChatSession>();

export const initProductSocket = (nsp: Namespace) => {
  nsp.on("connection", (socket) => {
    console.log("Client connected to /products namespace:", socket.id);

    // Handle product chat messages
    socket.on("send_message", async ({ message, userId }) => {
      try {
        if (!message || !userId) {
          socket.emit("receive_message", {
            success: false,
            reply: "Message and userId are required",
          });
          return;
        }

        // Initialize session if not exists
        let session = chatHistory.get(userId);
        if (!session) {
          session = {
            history: [
              new SystemMessage(
                "You are a professional AI shopping assistant. Answer user queries based on product context."
              ),
            ],
            lastMatchedProducts: [],
            lastQuery: "",
          };
          chatHistory.set(userId, session);
        }

        // Decide whether to perform vector search
        let matchedProducts = session.lastMatchedProducts || [];
        const shouldSearch =
          !session.lastQuery ||
          session.lastQuery.toLowerCase() !== message.toLowerCase();

        if (shouldSearch) {
          const queryVector = await getEmbeddings.embedQuery(message);
          //   matchedProducts = await EmbeddedProduct.aggregate([
          //     {
          //       $vectorSearch: {
          //         index: "product_search_index",
          //         queryVector,
          //         path: "embeddings",
          //         numCandidates: 100,
          //         limit: 5,
          //       },
          //     },
          //   ]);
          matchedProducts = await EmbeddedProduct.aggregate([
            {
              $vectorSearch: {
                index: "vector_product_index",
                queryVector,
                path: "embeddings",
                numCandidates: 100,
                limit: 5,
              },
            },
            {
              $lookup: {
                from: "products", // MongoDB collection name for Product
                localField: "product", // field in EmbeddedProduct
                foreignField: "_id", // field in Product
                as: "productData", // name of the populated field
              },
            },
            { $unwind: "$productData" }, // flatten the array
            {
              $project: {
                _id: 0,
                similarityScore: 1, // optional: include similarity if needed
                product: "$productData", // use populated product
              },
            },
          ]);

          session.lastMatchedProducts = matchedProducts;
          session.lastQuery = message;
        }

        // console.log("matchedProducts", matchedProducts);
        // Format matched products
        let productInfo = "No matching products found.";
        if (matchedProducts.length > 0) {
          productInfo = matchedProducts
            .map(
              (p, idx) => `
Product #${idx + 1}
-------------------------
Name: ${p.product.title}
Price: ₹${p.product.sellingPrice}
Description: ${p.product.description}
How To Use: ${p.product.howToUse}
Ingredients: ${p.product.ingredients}
Additional Details: ${p.product.additionalDetails}
Brand: ${p.product.brand}
Discount: ${p.product.discount}
`
            )
            .join("\n");
        }

        // Push user query + matched products
        session.history.push(
          new HumanMessage(`
User Query: ${message}

Matched Products:
${productInfo}
`)
        );

        // Initialize LLM
        // const model = await initChatModel("mistral-small-latest", {
        //   modelProvider: "mistralai",
        //   modelName: "mistral-small-latest",
        //   configPrefix: "mistral",
        //   configurableFields: ["model", "modelName", "configPrefix"],
        // });

        // // Get AI reply
        // const response = await model.invoke(session.history);

        console.log("Initializing model...");
        const model = await initChatModel("mistral-small-latest", {
          modelProvider: "mistralai",
          modelName: "mistral-small-latest",
          configPrefix: "mistral",
          configurableFields: ["model", "modelName", "configPrefix"],
        });
        console.log("Model initialized", model);

        console.log("session.history", session.history);

        const response = await model.invoke(session.history);
        console.log("AI response received", response.content);

        // Save AI reply
        session.history.push(new AIMessage(response.content));

        // Send response to client
        socket.emit("receive_message", {
          success: true,
          reply: response.content,
        });
      } catch (err: any) {
        console.error("Product Chat Error:", err);
        socket.emit("receive_message", {
          success: false,
          reply: err.message || "Internal error",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected from /products namespace:", socket.id);
    });
  });
};
