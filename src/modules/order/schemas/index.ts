import { Schema } from "mongoose";
import { IOrder } from "../types";
import { AddressModule, CartProductModule } from "../..";
import { TCartProduct } from "../../cartProduct/types";

export const orderAddressSchema = new Schema<
  Omit<AddressModule.Types.IAddress, "user">
>(AddressModule.Schemas.addressBaseFields, {
  versionKey: false,
});

export const orderProductSchema = new Schema<Omit<TCartProduct, "cart">>(
  CartProductModule.Schemas.cartProductBaseFields,
  { versionKey: false, timestamps: true }
);

export const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [orderProductSchema],
    addresses: {
      shipping: orderAddressSchema,
      billing: orderAddressSchema,
      both: orderAddressSchema,
    },
    // paymentMethod: { type: String, required: true },
    // paymentResult: {
    //   id: { type: String },
    //   status: { type: String },
    //   update_time: { type: String },
    //   email: { type: String },
    // },
    totalPrice: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    charges: { type: Number, default: 0 },
    // isPaid: { type: Boolean, default: false },
    // paidAt: { type: Date },
    // isDelivered: { type: Boolean, default: false },
    // deliveredAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);
