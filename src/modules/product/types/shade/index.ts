import { Types } from "mongoose";

export interface ShadeProps {
  _id?: Types.ObjectId | string;
  colorCode: string;
  shadeName: string;
  images: string[];
  stock: number;
}

export type TShadesFieldOnly = "colorCode" | "shadeName" | "stock";
