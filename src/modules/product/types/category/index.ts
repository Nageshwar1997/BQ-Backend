import { Types } from "mongoose";

export interface CategoryProps {
  name: string;
  category: string;
  level: number;
  parentCategory: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TCategoryFieldOnly = "category" | "name";
