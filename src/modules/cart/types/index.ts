import { Types } from "mongoose";

export interface ICart {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  products: Types.ObjectId[];
  charges: number;
  createdAt: Date;
  updatedAt: Date;
}
