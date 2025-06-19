import { ProductPopulateFieldsProps, ProductProps } from "../types";

export const productPopulateFields: ProductPopulateFieldsProps = {
  category: ["name", "category", "level", "parentCategory"],
  shades: ["shadeName", "colorCode", "images", "stock"],
  seller: ["firstName", "lastName", "phoneNumber", "email", "profilePic"],
};

export const possibleUpdateProductFields: (keyof ProductProps)[] = [
  "title",
  "brand",
  "originalPrice",
  "sellingPrice",
  "description",
  "howToUse",
  "ingredients",
  "additionalDetails",
  "totalStock",
];
