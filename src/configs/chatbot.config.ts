import { MistralAIEmbeddings } from "@langchain/mistralai";
import { MISTRAL_API_KEY_GET, MISTRAL_API_KEY_POST } from "../envs";

const postEmbeddings = new MistralAIEmbeddings({
  apiKey: MISTRAL_API_KEY_POST,
  model: "mistral-embed",
});

const getEmbeddings = new MistralAIEmbeddings({
  apiKey: MISTRAL_API_KEY_GET,
  model: "mistral-embed",
});

export const chatbotConfigs = {
  post: postEmbeddings,
  get: getEmbeddings,
};
