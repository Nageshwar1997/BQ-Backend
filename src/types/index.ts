import { Request } from "express";
import { Document } from "mongoose";

export interface FileUploaderProps {
  file: Express.Multer.File;
  folder?: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "USER" | "SELLER" | "ADMIN" | "MASTER";
  profilePic?: string;
}

// Interface for authenticated requests with user
export interface AuthenticatedRequest extends Request {
  user?: Omit<IUser, "password">; // User object without password
}

// Interface for authenticated requests with user
export interface AuthorizedRequest extends Request {
  user?: Omit<IUser, "password">; // User object without password
}
