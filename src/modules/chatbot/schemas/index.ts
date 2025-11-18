import { Schema } from "mongoose";
import { IEmbeddedProduct } from "../types";

export const embeddedProduct = new Schema<IEmbeddedProduct>(
  {
    embeddings: { type: [Number], required: true },
    searchText: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { versionKey: false }
);
