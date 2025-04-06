import { model } from "mongoose";
import userSchema from "../schemas/user.schema";
import blogSchema from "../schemas/blog.schema";
import homeVideoSchema from "../schemas/homeVideo.schema";
import productSchema from "../schemas/product/product.schema";
import categorySchema from "../schemas/product/category.schema";
import { ProductProps } from "../types";
import productShadeSchema from "../schemas/product/shade.schema";

const User = model("User", userSchema);
const Blog = model("Blog", blogSchema);
const HomeVideo = model("HomeVideo", homeVideoSchema);
const Product = model<ProductProps>("Product", productSchema);
const Category = model("Category", categorySchema);
const ProductShade = model("ProductShade", productShadeSchema);

export { User, Blog, HomeVideo, Product, Category, ProductShade };
