import { model } from "mongoose";
import { sellerSchema, userSchema } from "../schemas";
import { SellerProps, UserProps } from "../types";

export const User = model<UserProps>("User", userSchema);

export const Seller = model<SellerProps>("Seller", sellerSchema);
