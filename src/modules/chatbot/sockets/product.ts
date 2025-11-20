import { Namespace } from "socket.io";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  initChatModel,
} from "langchain";
import { ConnectionError } from "@mistralai/mistralai/models/errors/httpclienterrors";
import {
  getAiGeneratedSuggestedQuestion,
  getEmbeddedProducts,
  getMinimalProductsForAiPrompt,
} from "../services/product";
import { TProductChatSession } from "../types";
import { NODE_ENV } from "../../../envs";

const productChatHistory = new Map<string, TProductChatSession>();

export const initProductSocket = (nsp: Namespace) => {
  nsp.on("connection", (socket) => {
    socket.on("send_message", async ({ message, userId = "User_123" }) => {
      try {
        if (!message) {
          socket.emit("receive_message", {
            success: false,
            error: "Please ask me products related questions only.",
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
            )}\nGive a clear, helpful answer.`
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

        const suggestedQuestions: string[] =
          await getAiGeneratedSuggestedQuestion(
            accumulatedResponse,
            session.history
          );

        // Emit final complete response with suggested questions
        socket.emit("receive_message_complete", {
          success: true,
          fullResponse: accumulatedResponse,
          suggestedQuestions,
        });
      } catch (err: any) {
        let errMsg =
          "The AI shopping assistant is currently under heavy load. Please try again in a few moments.";

        if (NODE_ENV === "development") {
          if (err?.body) {
            try {
              const parsed = JSON.parse(err.body);

              errMsg = parsed.message || errMsg;
            } catch {
              console.log("Failed to parse error body");
            }
          } else if (err instanceof ConnectionError || err instanceof Error) {
            errMsg = err.message;
          }
        }

        socket.emit("receive_message", { success: false, error: errMsg });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected from /products namespace:", socket.id);
    });
  });
};
