import { ClientSession, Types } from "mongoose";
import { OrderModule, ProductModule, UserModule } from "../..";
import { SystemMessage, HumanMessage, AIMessage } from "langchain";

export type TBaseEmbedded = {
  embeddings: number[];
  searchText: string;
};
export interface IEmbeddedProduct extends TBaseEmbedded {
  product: Types.ObjectId;
}

export interface IEmbeddedOrder extends TBaseEmbedded {
  user: Types.ObjectId;
  order: Types.ObjectId;
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

export interface IAggregatedEmbeddedOrder
  extends Omit<IEmbeddedOrder, "order" | "user"> {
  user: UserModule.Types.UserProps;
  order: OrderModule.Types.IOrder;
}

export interface TCreateOrUpdateEmbeddedProduct {
  productId: IAggregatedEmbeddedProduct["product"]["_id"];
  title: IAggregatedEmbeddedProduct["product"]["title"];
  brand: IAggregatedEmbeddedProduct["product"]["brand"];
  category: IAggregatedEmbeddedProduct["product"]["category"];
  session?: ClientSession;
}

type TBaseChatSession = {
  history: (SystemMessage | HumanMessage | AIMessage)[];
  lastQuery?: string;
};

export interface IProductChatSession extends TBaseChatSession {
  lastMatchedProducts?: IAggregatedEmbeddedProduct[];
}

export interface IOrderChatSession extends TBaseChatSession {
  lastMatchedOrders?: IAggregatedEmbeddedOrder[];
}
