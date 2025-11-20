import { Namespace } from "socket.io";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  initChatModel,
} from "langchain";
import {
  getEmbeddedProducts,
  getMinimalProductsForAiPrompt,
} from "../services/product";
import { IAggregatedEmbeddedProduct } from "../types";
import { NODE_ENV } from "../../../envs";

interface ProductChatSession {
  history: (SystemMessage | HumanMessage | AIMessage)[];
  lastMatchedProducts?: IAggregatedEmbeddedProduct[];
  lastQuery?: string;
}

const productChatHistory = new Map<string, ProductChatSession>();

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
        let session = productChatHistory.get(userId);
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
          productChatHistory.set(userId, session);
        }

        // Vector search if needed
        let matchedProducts = session.lastMatchedProducts || [];
        const shouldSearch =
          !session.lastQuery ||
          session.lastQuery.toLowerCase() !== message.toLowerCase();

        if (shouldSearch) {
          matchedProducts = await getEmbeddedProducts(message);

          session.lastMatchedProducts = matchedProducts;
          session.lastQuery = message;
        }

        // Prepare minimal product info for AI context
        const minimalProducts = getMinimalProductsForAiPrompt(matchedProducts);

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
        const stream = await model?.stream(session.history);

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
        let friendlyMessage =
          "The AI shopping assistant is currently under heavy load. Please try again in a few moments.";

        if (err?.body && NODE_ENV === "development") {
          try {
            const parsed = JSON.parse(err.body);

            friendlyMessage = parsed.message || friendlyMessage;
          } catch (parseError) {
            console.log("Failed to parse error body", parseError);
          }
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
