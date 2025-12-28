import { ContentBlock, HumanMessage, initChatModel } from "langchain";
import { IProductChatSession } from "../types";

const normalizeAIContent = (
  content: string | (ContentBlock | { text?: string })[] | undefined
): string => {
  if (!content) return "";

  if (typeof content === "string") return content;

  // Array of content blocks → join text
  return content.map((block) => block?.text ?? "").join("");
};

export const getAiGeneratedSuggestedQuestion = async (
  lastResponse: string,
  isOrderOrProduct: "order" | "product",
  history: IProductChatSession["history"]
): Promise<string[]> => {
  try {
    const model = await initChatModel("mistral-small-latest", {
      modelProvider: "mistralai",
      modelName: "mistral-small-latest",
      disableStreaming: true, // non-streaming for suggested questions
    });

    const prompt = `
      Based on the following AI assistant response, suggest 1-3 short, ${isOrderOrProduct}-related follow-up questions that the user could ask next.
      Response: ${lastResponse}
      Format: Return only an array of questions in JSON.
    `;

    // Use invoke to get a single response chunk
    const aiOutput = await model.invoke([...history, new HumanMessage(prompt)]);

    let content = normalizeAIContent(aiOutput.content);

    // Remove ```json and ``` if present
    content = content
      ?.replace(/```json/g, "")
      ?.replace(/```/g, "")
      ?.trim();

    // Try to parse JSON array
    try {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: split by newlines and remove empty lines
      return content
        ?.split("\n")
        ?.map((q) => q.trim())
        ?.filter(Boolean);
    }

    return [];
  } catch (err) {
    console.log("Failed to generate suggested questions:", err);
    return [];
  }
};
