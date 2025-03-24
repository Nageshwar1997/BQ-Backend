import { model } from "mongoose";
import userSchema from "schemas/user.schema";
import blogSchema from "schemas/blog.schema";
import homeVideoSchema from "schemas/homeVideo.schema";

const User = model("User", userSchema);
const Blog = model("Blog", blogSchema);
const HomeVideo = model("HomeVideo", homeVideoSchema);

export { User, Blog, HomeVideo };
