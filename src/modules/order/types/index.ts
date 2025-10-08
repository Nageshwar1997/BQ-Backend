import { Types } from "mongoose";
import { AddressModule, CartProductModule } from "../..";

export interface IOrder {
  user: Types.ObjectId;
  products: CartProductModule.Types.IPopulatedCartProduct[];
  addresses: {
    shipping: Omit<AddressModule.Types.IAddress, "user"> | null;
    billing: Omit<AddressModule.Types.IAddress, "user"> | null;
    both: Omit<AddressModule.Types.IAddress, "user"> | null;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email: string;
  };
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
