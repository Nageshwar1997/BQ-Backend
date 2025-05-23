import { model } from "mongoose";
import userSchema from "../schemas/user.schema";
import blogSchema from "../schemas/blog.schema";
import homeVideoSchema from "../schemas/homeVideo.schema";
import productSchema from "../schemas/product/product.schema";
import categorySchema from "../schemas/product/category.schema";
import {
  BlogProps,
  CategoryProps,
  HomeVideoProps,
  ProductProps,
  ReviewProps,
  ShadeProps,
  UserProps,
} from "../types";
import productShadeSchema from "../schemas/product/shade.schema";
import reviewSchema from "../schemas/product/review.schema";

const User = model<UserProps>("User", userSchema);
const Blog = model<BlogProps>("Blog", blogSchema);
const HomeVideo = model<HomeVideoProps>("HomeVideo", homeVideoSchema);
const Product = model<ProductProps>("Product", productSchema);
const Category = model<CategoryProps>("Category", categorySchema);
const Shade = model<ShadeProps>("Shade", productShadeSchema);
const Review = model<ReviewProps>("Review", reviewSchema);

export { User, Blog, HomeVideo, Product, Category, Shade, Review };
