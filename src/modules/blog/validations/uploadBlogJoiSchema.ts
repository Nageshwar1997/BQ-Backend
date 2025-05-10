import { z } from "zod";
import {
  validateAuthor,
  validateContent,
  validateDescription,
  validateLargeThumbnail,
  validateMainTitle,
  validatePublishedDate,
  validatePublisher,
  validateSmallThumbnail,
  validateSubTitle,
  validateTags,
} from "../constants";

export const uploadBlogZodSchema = z.object({
  mainTitle: validateMainTitle,
  subTitle: validateSubTitle,
  content: validateContent,
  description: validateDescription,
  author: validateAuthor,
  tags: validateTags,
  publishedDate: validatePublishedDate,
  publisher: validatePublisher,
  smallThumbnail: validateSmallThumbnail,
  largeThumbnail: validateLargeThumbnail,
});
