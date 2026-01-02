import { Document, Types } from "mongoose";
import { TRole } from "../../../types";
import { AddressModule, ProductModule } from "../..";

export type TAuthProvider = "GOOGLE" | "MANUAL" | "LINKEDIN" | "GITHUB";
export interface UserProps extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: TRole;
  providers: TAuthProvider[];
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
}

type BaseSellerProps = Pick<UserProps, "email" | "phoneNumber"> & {
  name: string;
};

export interface SellerProps {
  _id: string | Types.ObjectId;
  user: string | Types.ObjectId;
  personalDetails: BaseSellerProps;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  businessDetails: BaseSellerProps & { category: string };
  businessAddress: Pick<
    AddressModule.Types.IAddress,
    "address" | "landmark" | "city" | "state" | "pinCode" | "country"
  > & { gst: string; pan: string };
  requiredDocuments: {
    gst: string;
    itr: string;
    addressProof: string;
    geoTagging: string;
  };
}

export interface IWishlist {
  _id: string | Types.ObjectId;
  products: Types.ObjectId[];
}

export interface IPopulatedWishlist {
  _id: string | Types.ObjectId | UserProps;
  products: ProductModule.Types.PopulatedProduct[];
}
