import { z } from "zod";
import { BlogThumbnailType } from "../types";
import { ALLOWED_IMAGE_TYPES } from "../../../constants";

export const BLOGS_THUMBNAILS: BlogThumbnailType[] = [
  "smallThumbnail",
  "largeThumbnail",
];

export const possibleEditBlogFields = [
  "mainTitle",
  "subTitle",
  "author",
  "description",
  "content",
  "tags",
  "publishedDate",
];

export const singleSpaceRegex = /^(?!.*\s{2,}).*$/;

export const validateMainTitle = z
  .string({
    required_error: "Main title is required.",
    invalid_type_error: "Main title must be a text value.",
  })
  .trim()
  .min(2, "Main title should be at least 2 characters long.")
  .max(100, "Main title should not exceed 100 characters.")
  .regex(singleSpaceRegex, "Only one space is allowed between words.");

export const validateSubTitle = z
  .string({
    required_error: "Subtitle is required.",
    invalid_type_error: "Subtitle must be a text value.",
  })
  .trim()
  .min(2, "Subtitle should be at least 2 characters long.")
  .max(100, "Subtitle should not exceed 100 characters.")
  .regex(singleSpaceRegex, "Only one space is allowed between words.");

export const validateContent = z
  .string({
    required_error: "Content is required.",
    invalid_type_error: "Content must be a text value.",
  })
  .trim()
  .min(10, "Content should be at least 10 characters long.")
  .regex(singleSpaceRegex, "Only one space is allowed between words.");

export const validateDescription = z
  .string({
    required_error: "Description is required.",
    invalid_type_error: "Description must be a text value.",
  })
  .trim()
  .min(10, "Description should be at least 10 characters long.")
  .regex(singleSpaceRegex, "Only one space is allowed between words.");

export const validateAuthor = z
  .string({
    required_error: "Author is required.",
    invalid_type_error: "Author must be a text value.",
  })
  .trim()
  .min(2, "Author should be at least 2 characters long.")
  .max(100, "Author should not exceed 100 characters.")
  .regex(singleSpaceRegex, "Only one space is allowed between words.");

export const validateTags = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    return val;
  },
  z
    .array(
      z
        .string({
          required_error: "Tag is required.",
          invalid_type_error: "Each tag must be a text value.",
        })
        .trim()
        .nonempty({ message: "Tag cannot be empty." })
        .min(2, "Tag should be at least 2 characters long.")
        .max(20, "Tag should not exceed 20 characters.")
        .regex(singleSpaceRegex, "Only one space is allowed between words."),
      {
        required_error: "Tags are required.",
        invalid_type_error: "Tags must be an array of text values.",
      }
    )
    .min(1, "At least one tag is required.")
    .refine(
      (tags) => {
        const trimmedTags = tags.map((tag) => tag.trim().toLowerCase());
        return new Set(trimmedTags).size === trimmedTags.length;
      },
      { message: "Duplicate tags are not allowed." }
    )
);

export const validatePublishedDate = z.preprocess(
  (val) =>
    typeof val === "string" || val instanceof Date ? new Date(val) : val,
  z
    .date({
      required_error: "Published date is required.",
      invalid_type_error: "Invalid date format.",
    })
    .max(new Date(), { message: "Publish date cannot be in the future." })
);

export const validatePublisher = z
  .string({
    required_error: "Publisher is required.",
    invalid_type_error: "Publisher must be a text value.",
  })
  .trim()
  .nonempty({ message: "Publisher cannot be empty." })
  .min(2, "Publisher should be at least 2 characters long.")
  .max(50, "Publisher should not exceed 50 characters.")
  .regex(singleSpaceRegex, "Only one space is allowed between words.");

export const validateSmallThumbnail = z
  .custom<Express.Multer.File>((file) => !!file && typeof file === "object", {
    message: "Small thumbnail is required.",
  })
  .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.mimetype), {
    message: `Small thumbnail must be an image of type: ${ALLOWED_IMAGE_TYPES.map(
      (type) => type.split("/")[1]
    ).join(", ")}`,
  });

export const validateLargeThumbnail = z
  .custom<Express.Multer.File>((file) => !!file && typeof file === "object", {
    message: "Large thumbnail is required.",
  })
  .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.mimetype), {
    message: `Large thumbnail must be an image of type: ${ALLOWED_IMAGE_TYPES.map(
      (type) => type.split("/")[1]
    ).join(", ")}`,
  });
