import { Types } from "mongoose";
import { CategoryProps, TCategoryFieldOnly } from "../category";
import { ShadeProps, TShadesFieldOnly } from "../shade";
import { ReviewModule, UserModule } from "../../..";
import { ValidateZodFieldConfigs } from "../../../../types";

export interface ProductPopulateFieldsProps {
  category: (keyof CategoryProps)[];
  shades: (keyof ShadeProps)[];
  seller: (keyof UserModule.Types.UserProps)[];
  reviews: (keyof ReviewModule.Types.ReviewProps)[];
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
  ingredients: string;
  additionalDetails: string;
  commonImages: string[];
  shades: Types.ObjectId[];
  category: Types.ObjectId;
  seller: Types.ObjectId;
  reviews: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface PopulatedProduct
  extends Omit<ProductProps, "category" | "shades"> {
  category: {
    _id: Types.ObjectId;
    name: string;
    category: string;
    level: number;
    parentCategory?: {
      _id: Types.ObjectId;
      name: string;
      category: string;
      level: number;
      parentCategory?: {
        _id: Types.ObjectId;
        name: string;
        category: string;
        level: number;
      };
    };
  };
  shades: ShadeProps[];
}

export type TProductFieldOnly =
  | "additionalDetails"
  | "brand"
  | "description"
  | "howToUse"
  | "ingredients"
  | "originalPrice"
  | "sellingPrice"
  | "title"
  | "totalStock";

export type TProductWithShadesWithCategoryFields =
  | TProductFieldOnly
  | TShadesFieldOnly
  | TCategoryFieldOnly;

export interface ValidateProductFieldConfigs extends ValidateZodFieldConfigs {
  field: TProductWithShadesWithCategoryFields;
}
