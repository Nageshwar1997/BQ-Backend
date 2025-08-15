import { Request, Response } from "express";
import { Aggregate, Document, FilterQuery, Query, Types } from "mongoose";

import { AppError } from "../../../classes";
import { isValidMongoId } from "../../../utils";
import { Review } from "../models";
import { isSafePopulateField } from "../../product/utils";
import { REVIEW_POPULATE_FIELDS } from "../constants";
import { ReviewPopulateFieldsProps, ReviewProps } from "../types";

type ReviewDoc = ReviewProps & Document;

export const getReviewsByProductIdController = async (
  req: Request,
  res: Response
) => {
  const { productId } = req.params;

  if (!productId) {
    throw new AppError("Product Id is required", 400);
  }

  isValidMongoId(productId, "Invalid Product Id provided", 404);

  const { sortBy = "most-recent", populateFields = {} } = req.query ?? {};
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = page && limit ? (page - 1) * limit : 0;

  const filters: FilterQuery<ReviewProps> = {
    product: new Types.ObjectId(productId),
    ...(sortBy === "with-images" && {
      images: { $exists: true, $type: "array", $ne: [] },
    }),
    ...(sortBy === "with-videos" && {
      videos: { $exists: true, $type: "array", $ne: [] },
    }),
    ...(sortBy === "images-and-videos" && {
      images: { $exists: true, $type: "array", $ne: [] },
      videos: { $exists: true, $type: "array", $ne: [] },
    }),
    ...(sortBy === "most-helpful" && {
      helpful: { $exists: true, $type: "array", $ne: [] },
    }),
  };

  let sortOptions: Partial<Record<keyof ReviewProps, 1 | -1>> = {};
  switch (sortBy) {
    case "most-recent":
      sortOptions = { createdAt: -1 };
      break;
    case "most-early":
      sortOptions = { createdAt: 1 };
      break;
    case "highest-rating":
      sortOptions = { rating: -1 };
      break;
    case "lowest-rating":
      sortOptions = { rating: 1 };
      break;
    default:
      sortOptions = { updatedAt: -1 };
  }

  let query: Query<ReviewDoc[], ReviewDoc> = Review.find(filters);

  // Apply DB sorting for normal cases
  if (sortBy !== "most-liked" && sortBy !== "most-disliked") {
    query = query.sort(sortOptions);
    if (page && limit) {
      query = query.skip((page - 1) * limit).limit(limit);
    }
  }

  // --- Safe population logic ---
  for (const [path, requestedFields] of Object.entries(populateFields) as [
    keyof ReviewPopulateFieldsProps,
    string[]
  ][]) {
    const allowed = REVIEW_POPULATE_FIELDS[path];
    const safe = requestedFields.filter((f): f is (typeof allowed)[number] =>
      isSafePopulateField(f, allowed)
    );
    if (!safe.length) continue;
    query = query.populate({ path, select: safe.join(" ") });
  }

  if (!Object.keys(populateFields).length) {
    query = query.populate("user", "firstName lastName profilePic");
  }

  // Execute query
  let reviews: ReviewProps[];

  if ("lean" in query) {
    reviews = await query.lean<ReviewProps[]>();
  } else {
    reviews = await (query as Aggregate<ReviewProps[]>);
  }

  // Handle most-liked / most-disliked with in-memory sort
  if (sortBy === "most-liked") {
    reviews.sort((a, b) => b.likes.length - a.likes.length);
  } else if (sortBy === "most-disliked") {
    reviews.sort((a, b) => b.dislikes.length - a.dislikes.length);
  }

  // Apply pagination for in-memory sorting
  if (sortBy === "most-liked" || sortBy === "most-disliked") {
    reviews = reviews.slice((page - 1) * limit, page * limit);
  }

  // Get total count for pagination metadata
  let total: number | undefined;

  if (page && limit) {
    total = await Review.countDocuments(filters);
  }

  res.success(200, "Reviews fetched successfully", {
    reviews,
    totalReviews: total ?? reviews.length,
    currentPage: page || 1,
    totalPages: total ? Math.ceil(total / limit) : 1,
  });
};
