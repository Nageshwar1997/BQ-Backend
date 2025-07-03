import { Types } from "mongoose";

export interface ShadeProps {
  _id?: Types.ObjectId;
  colorCode: string;
  shadeName: string;
  images: string[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TShadesFieldOnly = "colorCode" | "shadeName" | "stock";
