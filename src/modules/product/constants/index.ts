import { ProductPopulateFieldsProps, ProductProps } from "../types";

export const PRODUCT_POPULATE_FIELDS: ProductPopulateFieldsProps = {
  category: [
    "name",
    "category",
    "level",
    "parentCategory",
    "createdAt",
    "updatedAt",
  ],
  shades: [
    "shadeName",
    "colorCode",
    "images",
    "stock",
    "createdAt",
    "updatedAt",
  ],
  seller: [
    "firstName",
    "lastName",
    "phoneNumber",
    "email",
    "profilePic",
    "createdAt",
    "updatedAt",
  ],
  reviews: [
    "rating",
    "title",
    "comment",
    "images",
    "videos",
    "user",
    "product",
    "createdAt",
    "updatedAt",
  ],
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

export const POSSIBLE_PARSED_FIELDS = [
  "shades",
  "removingShadeImageUrls",
  "removingCommonImageURLs",
  "categoryLevelOne",
  "categoryLevelTwo",
  "categoryLevelThree",
  "removingShades",
  "newAddedShades",
  "updatedShadeWithFiles",
  "updatedShadeWithoutFiles",
  "removedQuillImageURLs",
];
