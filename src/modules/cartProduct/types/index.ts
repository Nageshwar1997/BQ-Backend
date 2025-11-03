import { Types } from "mongoose";
import { ProductModule } from "../..";

export type TCartProduct = {
  _id: Types.ObjectId;
  cart: Types.ObjectId;
  product: Types.ObjectId;
  shade?: Types.ObjectId;
  quantity: number;
};

export interface IPopulatedCartProduct
  extends Omit<TCartProduct, "product" | "shade"> {
  product: ProductModule.Types.ProductProps;
  shade?: ProductModule.Types.ShadeProps | null;
}
