import { Schema } from "mongoose";
import { HomeVideoProps } from "../types";

export const homeVideoSchema = new Schema<HomeVideoProps>(
  {
    m3u8Url: { type: String, required: true, trim: true },
    originalUrl: { type: String, required: true, trim: true },
    posterUrl: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);
