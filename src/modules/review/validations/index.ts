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
