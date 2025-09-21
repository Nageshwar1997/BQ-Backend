import { Types } from "mongoose";
import { UserModule } from "../..";
import { ADDRESS_TYPES } from "../constants";

export interface IAddress
  extends Pick<
    UserModule.Types.UserProps,
    "firstName" | "lastName" | "email" | "phoneNumber"
  > {
  user: Types.ObjectId;
  altPhoneNumber?: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: number;
  country: string;
  gst?: string;
  type: (typeof ADDRESS_TYPES)[number];
}

// Store all address references for a user
export interface IUserAddresses {
  user: Types.ObjectId;
  addresses: Types.ObjectId[];
  defaultAddress?: Types.ObjectId;
}
