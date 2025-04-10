import { Schema } from "mongoose";
import { UserProps } from "../types";

const userSchema = new Schema<UserProps>(
  {
    firstName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    profilePic: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["USER", "SELLER", "ADMIN", "MASTER"],
      default: "MASTER",
    },

    password: {
      type: String,
      trim: true,
    },
    // addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    // cart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
    // wishlist: [{ type: Schema.Types.ObjectId, ref: "Wishlist" }],
    // orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    // reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // ratings: [{ type: Schema.Types.ObjectId, ref: "Rating" }],
    // payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default userSchema;
