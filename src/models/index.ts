import { model } from "mongoose";
import userSchema from "../schemas/user.schema";
import blogSchema from "../schemas/blog.schema";
import homeVideoSchema from "../schemas/homeVideo.schema";
import productSchema from "../schemas/product/product.schema";
import categorySchema from "../schemas/product/category.schema";
import { ProductProps } from "../types";

const User = model("User", userSchema);
const Blog = model("Blog", blogSchema);
const HomeVideo = model("HomeVideo", homeVideoSchema);
const Product = model<ProductProps>("Product", productSchema);
const Category = model("Category", categorySchema);

export { User, Blog, HomeVideo, Product, Category };
