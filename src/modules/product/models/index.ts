import { model } from "mongoose";
import { CategoryProps, ProductProps, ShadeProps } from "../types";
import { categorySchema, productSchema, productShadeSchema } from "../schemas";

export const Category = model<CategoryProps>("Category", categorySchema);
export const Shade = model<ShadeProps>("Shade", productShadeSchema);
export const Product = model<ProductProps>("Product", productSchema);
