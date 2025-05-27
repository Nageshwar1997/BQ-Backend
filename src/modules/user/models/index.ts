import { model } from "mongoose";
import { userSchema } from "../schemas";
import { UserProps } from "../types";

export const User = model<UserProps>("User", userSchema);
