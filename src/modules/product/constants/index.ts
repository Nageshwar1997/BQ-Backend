import { ProductPopulateFieldsProps } from "../types";

export const productPopulateFields: ProductPopulateFieldsProps = {
  category: ["name", "category", "level", "parentCategory"],
  shades: ["_id", "shadeName", "colorCode", "images", "stock"],
  seller: ["firstName", "lastName", "phoneNumber", "email", "profilePic"],
};
