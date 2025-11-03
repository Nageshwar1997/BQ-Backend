import { model } from "mongoose";
import { IOrder } from "../types";
import { orderSchema } from "../schemas";

export const Order = model<IOrder>("Order", orderSchema);
