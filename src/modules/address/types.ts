import { Types } from "mongoose";
import { constants } from "../../constants";
import { UserModule } from "..";

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
  country: (typeof constants.common.ALLOWED_COUNTRIES)[number];
  gst?: string;
  type: (typeof constants.common.ADDRESS_TYPES)[number];
}

// Store all address references for a user
export interface IUserAddresses {
  user: Types.ObjectId;
  addresses: Types.ObjectId[];
  defaultAddress?: Types.ObjectId;
}
