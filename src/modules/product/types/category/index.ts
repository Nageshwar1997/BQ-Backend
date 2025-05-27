import { Types } from "mongoose";

export interface CategoryProps {
  name: string;
  category: string;
  level: number;
  parentCategory: Types.ObjectId | null;
}

export type TCategoryFieldOnly = "category" | "name";
