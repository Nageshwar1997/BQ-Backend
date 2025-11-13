import { model } from "mongoose";
import { sellerSchema, userSchema, wishlistSchema } from "../schemas";
import { IWishlist, SellerProps, UserProps } from "../types";

export const User = model<UserProps>("User", userSchema);

export const Seller = model<SellerProps>("Seller", sellerSchema);

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
