import { Types } from "mongoose";
import { ValidateZodFieldProps } from "../../../../types";

export interface CategoryProps {
  name: string;
  category: string;
  level: number;
  parentCategory: Types.ObjectId | null;
}

export type ValidateCategoryFieldProps = ValidateZodFieldProps;
