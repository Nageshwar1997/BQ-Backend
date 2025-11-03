import { Types } from "mongoose";
import { ROLES } from "../../../constants";

export interface UserProps {
  _id: string | Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: (typeof ROLES)[number];
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
}
