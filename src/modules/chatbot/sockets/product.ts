import { Socket } from "socket.io";
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
import { IProductChatSession } from "../types";
import { IS_PROD } from "../../../envs";
import { getAiGeneratedSuggestedQuestion } from "../utils";

const productChatHistory = new Map<string, IProductChatSession>();

export const initProductSocket = (socket: Socket) => {
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

      const minimalProducts = getMinimalProductsForAiPrompt(matchedProducts);

      session.history.push(
        new HumanMessage(
          `User Query: ${message}\nMatched Products: ${JSON.stringify(
            minimalProducts
          )}\nGive a clear, helpful answer.`
        )
      );

      // Initialize AI model for streaming
      const model = await initChatModel("mistral-small-latest", {
        modelProvider: "mistralai",
        modelName: "mistral-small-latest",
        configPrefix: "mistral",
        configurableFields: ["model", "modelName", "configPrefix"],
        disableStreaming: false,
      });

      const stream = await model?.stream(session.history);
      let accumulatedResponse = "";

      for await (const chunk of stream) {
        const chunkText = chunk.content || "";
        accumulatedResponse += chunkText;

        socket.emit("receive_message_chunk", {
          success: true,
          chunk: chunkText,
        });
      }

      session.history.push(new AIMessage(accumulatedResponse));

      const suggestedQuestions: string[] =
        await getAiGeneratedSuggestedQuestion(
          accumulatedResponse,
          "product",
          session.history
        );

      socket.emit("receive_message_complete", {
        success: true,
        fullResponse: accumulatedResponse,
        suggestedQuestions,
      });
    } catch (err: any) {
      let errMsg =
        "The AI shopping assistant is currently under heavy load. Please try again in a few moments.";

      if (IS_PROD === "false") {
        if (err?.body) {
          try {
            const parsed = JSON.parse(err.body);
            errMsg = parsed.message || errMsg;
          } catch {
            console.log("Failed to parse error body");
          }
        } else if (err instanceof Error) {
          errMsg = err.message;
        }
      }

      socket.emit("receive_message", { success: false, error: errMsg });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from /products namespace:", socket.id);
  });
};
