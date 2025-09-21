import { model } from "mongoose";
import { addressSchema } from "../schemas";
import { IAddress } from "../types";

export const Address = model<IAddress>("Address", addressSchema);
