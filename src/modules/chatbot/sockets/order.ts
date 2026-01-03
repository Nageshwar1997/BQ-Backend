import { Socket } from "socket.io";
import { IOrderChatSession } from "../types";
import {
  AIMessage,
  HumanMessage,
  initChatModel,
  SystemMessage,
} from "langchain";
import { getEmbeddedOrders, getMinimalOrdersForAiPrompt } from "../services";
import { getAiGeneratedSuggestedQuestion } from "../utils";
import { IS_PROD } from "../../../envs";

const orderChatHistory = new Map<string, IOrderChatSession>();

export const initOrderSocket = (socket: Socket) => {
  socket.on("send_message", async ({ message, userId }) => {
    try {
      if (!userId) {
        socket.emit("receive_message", {
          success: false,
          error: "You need to be logged in first.",
        });
        return;
      }
      if (!message || !userId) {
        socket.emit("receive_message", {
          success: false,
          error: "Please ask me orders related questions only.",
        });
        return;
      }

      // Initialize session if not exists
      let session = orderChatHistory.get(userId);
      if (!session) {
        session = {
          history: [
            new SystemMessage(
              "You are a professional AI shopping assistant. Answer user queries based on order context."
            ),
          ],
          lastMatchedOrders: [],
          lastQuery: "",
        };
        orderChatHistory.set(userId, session);
      }

      // Vector search if needed
      let matchedOrders = session.lastMatchedOrders || [];
      const shouldSearch =
        !session.lastQuery ||
        session.lastQuery.toLowerCase() !== message.toLowerCase();

      if (shouldSearch) {
        matchedOrders = await getEmbeddedOrders(message, userId);

        session.lastMatchedOrders = matchedOrders;
        session.lastQuery = message;
      }
      // Prepare minimal order info for AI context
      const minimalOrders = getMinimalOrdersForAiPrompt(matchedOrders);

      // Push user message with order context
      session.history.push(
        new HumanMessage(
          `User Query: ${message}\nMatched Orders: ${JSON.stringify(
            minimalOrders
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
          "order",
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
    console.log("Client disconnected from /orders namespace:", socket.id);
  });
};
