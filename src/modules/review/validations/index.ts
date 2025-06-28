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
