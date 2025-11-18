import { ProductModule } from "../..";

export interface IEmbeddedProduct {
  embeddings: number[];
  searchText: string;
  product: ProductModule.Types.PopulatedProduct;
}
