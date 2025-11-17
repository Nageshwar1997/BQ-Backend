import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { AppError } from "../../classes";
import { connectDB } from "../database";
import { MistralEmbeddings } from "../../classes/MistralEmbeddings";
import { MistralAIEmbeddings } from "@langchain/mistralai";

export const embeddings = new MistralAIEmbeddings();

interface VectorStoreOptions {
  collectionName: string; // e.g., "product_embeddings" or "order_embeddings"
  indexName: "product_vector_index" | "order_vector_index"; // corresponding vector index in MongoDB Atlas
  textKey?: string; // optional, default: "metadata.searchText"
  embeddingKey?: string; // optional, default: "embedding"
  primaryKey?: string; // optional, default: "_id"
}

export const getVectorStore = async ({
  collectionName,
  indexName,
  textKey = "metadata.searchText",
  embeddingKey = "embedding",
  primaryKey = "_id",
}: VectorStoreOptions): Promise<MongoDBAtlasVectorSearch> => {
  const client = await connectDB();
  const db = client.connection.db;

  if (!db) {
    throw new AppError("Database not connected", 500);
  }

  const collection = db.collection(collectionName) as any;

  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection,
    indexName,
    textKey,
    embeddingKey,
    primaryKey,
  });

  console.log("vectorStore", vectorStore);

  return vectorStore;
};
