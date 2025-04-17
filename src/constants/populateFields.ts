import { CategoryProps, ShadeProps, UserProps } from "../types";

export interface ProductPopulateFieldsProps {
  category: (keyof CategoryProps)[];
  shades: (keyof ShadeProps)[];
  seller: (keyof UserProps)[];
}

export const productPopulateFields: ProductPopulateFieldsProps = {
  category: ["name", "level", "parentCategory"],
  shades: ["shadeName", "colorCode", "images", "stock"],
  seller: ["firstName", "lastName", "phoneNumber", "email", "profilePic"],
};
