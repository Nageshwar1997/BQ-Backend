import { Types } from "mongoose";
import { CartProductModule } from "../..";

export interface ICart {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  products: Types.ObjectId[];
  charges: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedCart extends Omit<ICart, "products"> {
  products: CartProductModule.Types.IPopulatedCartProduct[];
}
