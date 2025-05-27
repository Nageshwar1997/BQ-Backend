import { Document, Types } from "mongoose";

export type UserRoleType = "USER" | "SELLER" | "ADMIN" | "MASTER";

export interface UserProps extends Document {
  _id: string | Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRoleType;
  profilePic?: string;
}
