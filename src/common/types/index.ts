import { Request } from "express";
import { User } from "../../modules";

// Connection config interface
export interface IMongoOptions {
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  maxPoolSize: number;
  minPoolSize?: number;
}

export interface AuthRequest extends Request {
  user?: Omit<User.Types.UserProps, "password">;
}
