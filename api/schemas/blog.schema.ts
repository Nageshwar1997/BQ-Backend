import { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    mainTitle: {
      type: String,
      trim: true,
      required: true,
    },
    subTitle: {
      type: String,
      trim: true,
      required: true,
    },
    author: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    smallThumbnail: {
      type: String,
      trim: true,
      required: true,
    },
    largeThumbnail: {
      type: String,
      trim: true,
      required: true,
    },
    publisher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default blogSchema;
