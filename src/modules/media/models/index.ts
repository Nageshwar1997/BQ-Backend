import { model } from "mongoose";
import { HomeVideoProps } from "../types";
import { homeVideoSchema } from "../schemas";

export const HomeVideo = model<HomeVideoProps>("HomeVideo", homeVideoSchema);
