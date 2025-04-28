import { Types } from "mongoose";
import { CategoryProps } from "../category";
import { ShadeProps } from "../shade";
import { UserProps } from "../../../user/types";

export interface ProductPopulateFieldsProps {
  category: (keyof CategoryProps)[];
  shades: (keyof ShadeProps)[];
  seller: (keyof UserProps)[];
}

export interface ProductProps {
  title: string;
  brand: string;
  originalPrice: number;
  sellingPrice: number;
  totalStock: number;
  discount: number;
  description: string;
  howToUse: string;
  ingredients?: string;
  additionalDetails?: string;
  commonImages: string[];
  shades?: ShadeProps[];
  category: Types.ObjectId;
  seller: Types.ObjectId;
  reviews: Types.ObjectId[];
}
