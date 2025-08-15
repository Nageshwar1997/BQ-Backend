import { Types } from "mongoose";

export type UserRoleType = "USER" | "SELLER" | "ADMIN" | "MASTER";

export interface UserProps {
  _id: string | Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRoleType;
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
}
