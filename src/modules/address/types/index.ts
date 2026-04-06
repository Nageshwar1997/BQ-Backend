import { Types } from "mongoose";
import { UserModule } from "../..";
import { ADDRESS_TYPES } from "../constants";
import { Constants } from "../../../Constants";

export interface IAddress extends Pick<
  UserModule.Types.UserProps,
  "firstName" | "lastName" | "email" | "phoneNumber"
> {
  user: Types.ObjectId;
  altPhoneNumber?: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  country: (typeof Constants.Common.ALLOWED_COUNTRIES)[number];
  gst?: string;
  type: (typeof ADDRESS_TYPES)[number];
}

// Store all address references for a user
export interface IUserAddresses {
  user: Types.ObjectId;
  addresses: Types.ObjectId[];
  defaultAddress?: Types.ObjectId;
}
