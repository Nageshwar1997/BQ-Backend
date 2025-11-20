import { Types } from "mongoose";
import { ProductModule } from "../..";
import { SystemMessage, HumanMessage, AIMessage } from "langchain";

export interface IEmbeddedProduct {
  embeddings: number[];
  searchText: string;
  product: Types.ObjectId;
}

export interface IAggregatedEmbeddedProduct
  extends Omit<IEmbeddedProduct, "product"> {
  product: Omit<
    ProductModule.Types.PopulatedProduct,
    | "shades"
    | "category"
    | "reviews"
    | "updatedAt"
    | "totalStock"
    | "totalSales"
    | "seller"
    | "rating"
    | "createdAt"
    | "commonImages"
  > & {
    shades: string[];
    category: Record<"grandParent" | "parent" | "child", string>;
  };
}

export interface TCreateOrUpdateEmbeddedProduct {
  productId: IAggregatedEmbeddedProduct["product"]["_id"];
  title: IAggregatedEmbeddedProduct["product"]["title"];
  brand: IAggregatedEmbeddedProduct["product"]["brand"];
  category: IAggregatedEmbeddedProduct["product"]["category"];
}

export interface TProductChatSession {
  history: (SystemMessage | HumanMessage | AIMessage)[];
  lastMatchedProducts?: IAggregatedEmbeddedProduct[];
  lastQuery?: string;
}
