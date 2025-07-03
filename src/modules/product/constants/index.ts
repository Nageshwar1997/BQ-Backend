import { ProductPopulateFieldsProps, ProductProps } from "../types";

export const PRODUCT_POPULATE_FIELDS: ProductPopulateFieldsProps = {
  category: ["name", "category", "level", "parentCategory"],
  shades: ["shadeName", "colorCode", "images", "stock"],
  seller: ["firstName", "lastName", "phoneNumber", "email", "profilePic"],
  reviews: ["rating", "title", "comment", "images", "videos", "user"],
};

export const POSSIBLE_UPDATE_PRODUCT_FIELDS: (keyof ProductProps)[] = [
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

export const POSSIBLE_PRODUCT_REQUIRED_FIELDS: (keyof ProductProps)[] = [
  ...POSSIBLE_UPDATE_PRODUCT_FIELDS,
  "discount",
  "commonImages",
  "shades",
  "category",
  "seller",
  "reviews",
  "_id",
  "createdAt",
  "updatedAt",
];
