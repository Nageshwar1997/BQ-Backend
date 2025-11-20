import { Schema } from "mongoose";
import { IEmbeddedOrder, IEmbeddedProduct } from "../types";

export const embeddedProductSchema = new Schema<IEmbeddedProduct>(
  {
    embeddings: { type: [Number], required: true },
    searchText: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { versionKey: false }
);

export const embeddedOrderSchema = new Schema<IEmbeddedOrder>(
  {
    embeddings: { type: [Number], required: true },
    searchText: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  },
  { versionKey: false }
);
