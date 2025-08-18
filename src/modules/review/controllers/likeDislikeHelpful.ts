import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { isValidMongoId } from "../../../utils";
import { Review } from "../models";
import { AppError } from "../../../classes";
import { Types } from "mongoose";

export const likeDislikeHelpfulController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { reviewId } = req.params;
  isValidMongoId(reviewId, "Invalid Review Id provided", 404);
  const { liked, disliked, isHelpful } = req.body ?? {};

  const user = req.user;
  const review = await Review.findById(reviewId);

  if (!user) throw new AppError("User not found", 404);
  if (!review) throw new AppError("Review not found", 404);

  const userId = new Types.ObjectId(user._id);

  // LIKE
  if (liked !== undefined) {
    if (liked) {
      if (!review.likes.some((id) => id.equals(userId))) {
        review.likes.push(userId);
      }
    } else {
      review.likes = review.likes.filter((id) => !id.equals(userId));
    }
  }

  // DISLIKE
  if (disliked !== undefined) {
    if (disliked) {
      if (!review.dislikes.some((id) => id.equals(userId))) {
        review.dislikes.push(userId);
      }
    } else {
      review.dislikes = review.dislikes.filter((id) => !id.equals(userId));
    }
  }

  // HELPFUL
  if (isHelpful !== undefined) {
    if (isHelpful) {
      if (!review.helpful.some((id) => id.equals(userId))) {
        review.helpful.push(userId);
      }
    } else {
      review.helpful = review.helpful.filter((id) => !id.equals(userId));
    }
  }

  await review.save();

  res.success(200, "Review updated successfully");
};
