import { model } from "mongoose";
import { productEmbeddingSchema } from "../schemas";

export const ProductEmbedding = model(
  "ProductEmbedding",
  productEmbeddingSchema,
  "product_embeddings"
);
