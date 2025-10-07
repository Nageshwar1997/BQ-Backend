import { Schema } from "mongoose";
import { UserProps } from "../types";

export const userSchema = new Schema<UserProps>(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    profilePic: { type: String, default: "", trim: true },
    role: {
      type: String,
      enum: ["USER", "SELLER", "ADMIN", "MASTER"],
      default: "MASTER",
    },
    password: { type: String, trim: true },
    // addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    // cart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
    // wishlist: [{ type: Schema.Types.ObjectId, ref: "Wishlist" }],
    // orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    // reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // ratings: [{ type: Schema.Types.ObjectId, ref: "Rating" }],
    // payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  { versionKey: false, timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ role: 1 });
