import { Types } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  shade: Types.ObjectId;
  totalPrice: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface ICart {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  products: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}
