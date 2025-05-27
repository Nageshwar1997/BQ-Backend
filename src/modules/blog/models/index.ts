import { model } from "mongoose";
import { BlogProps } from "../types";
import { blogSchema } from "../schemas";

export const Blog = model<BlogProps>("Blog", blogSchema);
