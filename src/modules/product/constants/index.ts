import { ProductPopulateFieldsProps } from "../types";

export const productPopulateFields: ProductPopulateFieldsProps = {
  category: ["name", "level", "parentCategory"],
  shades: ["shadeName", "colorCode", "images", "stock"],
  seller: ["firstName", "lastName", "phoneNumber", "email", "profilePic"],
};
