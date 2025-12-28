import { Schema } from "mongoose";
import { IWishlist, SellerProps, UserProps } from "../types";
import {
  ALLOWED_BUSINESSES,
  ALLOWED_COUNTRIES,
  AUTH_PROVIDERS,
  ROLES,
  STATES_AND_UNION_TERRITORIES,
} from "../../../constants";

export const userSchema = new Schema<UserProps>(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    profilePic: { type: String, default: "", trim: true },
    role: { type: String, enum: ROLES, default: "USER" },
    password: { type: String, trim: true },
    provider: { type: String, enum: AUTH_PROVIDERS, default: "MANUAL" },
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
userSchema.index(
  { phoneNumber: 1 },
  { unique: true, partialFilterExpression: { phoneNumber: { $ne: "" } } }
);
userSchema.index({ role: 1 });

const businessAddressSchema = new Schema<SellerProps["businessAddress"]>(
  {
    address: { type: String, required: true, minlength: 3 },
    landmark: { type: String, default: "" },
    city: { type: String, required: true, minlength: 2 },
    state: { type: String, required: true, enum: STATES_AND_UNION_TERRITORIES },
    pinCode: { type: String, required: true, minlength: 6, maxlength: 6 },
    country: {
      type: String,
      required: true,
      enum: ALLOWED_COUNTRIES,
      default: "India",
    },
    pan: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      uppercase: true,
    },
    gst: {
      type: String,
      required: true,
      minlength: 15,
      maxlength: 15,
      uppercase: true,
    },
  },
  { versionKey: false, _id: false }
);

const personalDetailsSchema = new Schema<SellerProps["personalDetails"]>(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true, minlength: 10, maxlength: 10 },
  },
  { versionKey: false, _id: false }
);

const businessDetailsSchema = new Schema<SellerProps["businessDetails"]>(
  {
    name: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true, minlength: 10, maxlength: 10 },
    category: { type: String, required: true, enum: ALLOWED_BUSINESSES },
  },
  { versionKey: false, _id: false }
);

const requiredDocumentsSchema = new Schema<SellerProps["requiredDocuments"]>(
  {
    gst: { type: String, required: true },
    itr: { type: String, required: true },
    geoTagging: { type: String, required: true },
    addressProof: { type: String, required: true },
  },
  { versionKey: false, _id: false }
);

export const sellerSchema = new Schema<SellerProps>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessAddress: businessAddressSchema,
    personalDetails: personalDetailsSchema,
    businessDetails: businessDetailsSchema,
    requiredDocuments: requiredDocumentsSchema,
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { versionKey: false, timestamps: true }
);

export const wishlistSchema = new Schema<IWishlist>(
  {
    _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { versionKey: false, timestamps: true }
);
