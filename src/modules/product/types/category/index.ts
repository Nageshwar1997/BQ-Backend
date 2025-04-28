import { Types } from "mongoose";

export interface CategoryProps {
  name: string;
  level: number;
  parentCategory?: Types.ObjectId | null;
}
