import { Types } from "mongoose";
import { ProductModule } from "../..";

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
