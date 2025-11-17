import { Mistral } from "@mistralai/mistralai";
import { AppError } from "./AppError";
import { MISTRAL_API_KEY } from "../envs";

export const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });

export class MistralEmbeddings {
  async embedDocuments(documents: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const doc of documents) {
      const res = await mistralClient.embeddings.create({
        model: "mistral-embed",
        inputs: [doc],
      });

      if (!res.data[0]?.embedding) {
        throw new AppError("Embedding not returned for document", 400);
      }

      vectors.push(res.data[0].embedding as number[]);
    }
    return vectors;
  }

  async embedQuery(query: string): Promise<number[]> {
    const res = await mistralClient.embeddings.create({
      model: "mistral-small-latest",
      inputs: [query],
    });

    if (!res.data[0]?.embedding) {
      throw new Error("Embedding not returned for query");
    }

    return res.data[0].embedding as number[];
  }
}
