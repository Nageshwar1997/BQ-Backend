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

        // Vector search if needed
        let matchedProducts = session.lastMatchedProducts || [];
        const shouldSearch =
          !session.lastQuery ||
          session.lastQuery.toLowerCase() !== message.toLowerCase();

        if (shouldSearch) {
          const queryVector = await getEmbeddings.embedQuery(message);

          matchedProducts = await EmbeddedProduct.aggregate([
            // 1️⃣ Vector search
            {
              $vectorSearch: {
                index: "vector_product_index",
                queryVector,
                path: "embeddings",
                numCandidates: 100,
                limit: 5,
              },
            },

            // 2️⃣ Lookup product
            {
              $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productData",
              },
            },
            { $unwind: "$productData" },

            // 3️⃣ Lookup shades
            {
              $lookup: {
                from: "shades",
                localField: "productData.shades",
                foreignField: "_id",
                as: "shadesData",
              },
            },

            // 4️⃣ Lookup category
            {
              $lookup: {
                from: "categories",
                localField: "productData.category",
                foreignField: "_id",
                as: "categoryData",
              },
            },
            { $unwind: "$categoryData" },

            // 5️⃣ Parent category
            {
              $lookup: {
                from: "categories",
                localField: "categoryData.parentCategory",
                foreignField: "_id",
                as: "parentCategoryData",
              },
            },
            {
              $unwind: {
                path: "$parentCategoryData",
                preserveNullAndEmptyArrays: true,
              },
            },

            // 6️⃣ Grandparent category
            {
              $lookup: {
                from: "categories",
                localField: "parentCategoryData.parentCategory",
                foreignField: "_id",
                as: "grandParentCategoryData",
              },
            },
            {
              $unwind: {
                path: "$grandParentCategoryData",
                preserveNullAndEmptyArrays: true,
              },
            },

            // 7️⃣ Final projection with category inside product
            {
              $project: {
                _id: 0,
                similarityScore: 1,

                product: {
                  title: "$productData.title",
                  brand: "$productData.brand",
                  sellingPrice: "$productData.sellingPrice",
                  originalPrice: "$productData.originalPrice",
                  discount: "$productData.discount",
                  howToUse: "$productData.howToUse",
                  ingredients: "$productData.ingredients",
                  additionalDetails: "$productData.additionalDetails",
                  commonImages: "$productData.commonImages",

                  // ✅ Populate shades as full objects
                  shades: {
                    $map: {
                      input: "$productData.shades",
                      as: "s",
                      in: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$shadesData",
                              as: "sd",
                              cond: { $eq: ["$$sd._id", "$$s"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },

                  // ✅ Move category inside product
                  category: {
                    _id: "$categoryData._id",
                    name: "$categoryData.name",
                    category: "$categoryData.category",
                    level: "$categoryData.level",
                    parentCategory: {
                      _id: "$parentCategoryData._id",
                      name: "$parentCategoryData.name",
                      category: "$parentCategoryData.category",
                      level: "$parentCategoryData.level",
                      parentCategory: {
                        _id: "$grandParentCategoryData._id",
                        name: "$grandParentCategoryData.name",
                        category: "$grandParentCategoryData.category",
                        level: "$grandParentCategoryData.level",
                      },
                    },
                  },
                },
              },
            },
          ]);

          session.lastMatchedProducts = matchedProducts;
          session.lastQuery = message;
        }

        console.log("MATCHED_PRODUCTS", matchedProducts[0].product.category);

        // Prepare minimal product info for AI context
        const minimalProducts = matchedProducts?.map((p, i) => ({
          Product: i + 1,
          Name: p.product.title,
          Brand: p.product.brand,
          Price: p.product.sellingPrice,
          Description: p.product.description,
          ...(p.product.howToUse && { "How To Use": p.product.howToUse }),
          ...(p.product.ingredients && { Ingredients: p.product.ingredients }),
          ...(p.product.additionalDetails && {
            "Additional Details": p.product.additionalDetails,
          }),
          ...(p.product.shades?.length > 0 && {
            Shades: p.product.shades.map((s) => s.shadeName).join(", "),
          }),
          Discount: p.product.discount,
        }));

        // Push user message with product context
        session.history.push(
          new HumanMessage(
            `User Query: ${message}\nMatched Products: ${JSON.stringify(
              minimalProducts
            )}`
          )
        );

        // Initialize streaming AI model
        const model = await initChatModel("mistral-small-latest", {
          modelProvider: "mistralai",
          modelName: "mistral-small-latest",
          configPrefix: "mistral",
          configurableFields: ["model", "modelName", "configPrefix"],
          disableStreaming: false, // enable streaming
        });

        // Stream response chunk by chunk
        const stream = await model.stream(session.history);

        let accumulatedResponse = "";

        for await (const chunk of stream) {
          const chunkText = chunk.content || "";
          accumulatedResponse += chunkText;

          // Emit chunk to frontend immediately
          socket.emit("receive_message_chunk", {
            success: true,
            chunk: chunkText,
          });
        }

        // Save full AI response in session
        session.history.push(new AIMessage(accumulatedResponse));

        // Emit final complete response event (optional)
        socket.emit("receive_message_complete", {
          success: true,
          fullResponse: accumulatedResponse,
        });
      } catch (err: any) {
        console.error("Product Chat Error:", err);

        // Handle rate-limit / capacity errors
        const isMistral429 =
          err?.statusCode === 429 ||
          err?.code === "3505" ||
          err?.body?.includes?.("service_tier_capacity_exceeded") ||
          err?.message?.includes?.("Service tier capacity exceeded");

        let friendlyMessage =
          err?.message ||
          "Something went wrong, please try again after a while.";

        if (isMistral429) {
          friendlyMessage =
            "The AI shopping assistant is currently under heavy load. " +
            "Please try again in a few moments, or send a shorter/simple message.";
        }

        socket.emit("receive_message", {
          success: false,
          reply: friendlyMessage,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected from /products namespace:", socket.id);
    });
  });
};
