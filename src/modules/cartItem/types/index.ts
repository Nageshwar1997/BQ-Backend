import { Types } from "mongoose";

export type TCartProduct = {
  _id: Types.ObjectId;
  cart: Types.ObjectId;
  product: Types.ObjectId;
  shade?: Types.ObjectId;
  quantity: number;
};
