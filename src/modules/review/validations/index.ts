import { z } from "zod";
import { validateZodNumber, validateZodString } from "../../../utils";

export const createReviewZodSchema = z.object({
  rating: validateZodNumber({ field: "rating", min: 1, max: 5 }),
  title: validateZodString({
    field: "title",
    min: 2,
    blockMultipleSpaces: true,
  }),
  comment: validateZodString({
    field: "comment",
    min: 2,
    blockMultipleSpaces: true,
  }),
});

export const updateReviewZodSchema = createReviewZodSchema.partial().extend({
  productTitle: validateZodString({
    field: "productTitle",
    min: 2,
    blockMultipleSpaces: true,
    isOptional: true,
  }),
  removedImages: z
    .array(
      validateZodString({
        field: "removedImages[some_index]",
        blockSingleSpace: true,
      })
    )
    .optional()
    .default([]),
  removedVideos: z
    .array(
      validateZodString({
        field: "removedVideos[some_index]",
        blockSingleSpace: true,
      })
    )
    .optional()
    .default([]),
});

export const updateLikeDislikeHelpfulSchema = z.object({
  liked: z
    .boolean({ invalid_type_error: "Liked must be a boolean" })
    .optional(),
  disliked: z
    .boolean({ invalid_type_error: "Disliked must be a boolean" })
    .optional(),
  isHelpful: z
    .boolean({ invalid_type_error: "IsHelpful must be a boolean" })
    .optional(),
});
