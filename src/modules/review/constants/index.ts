import { ReviewPopulateFieldsProps, ReviewProps } from "../types";

export const possibleUpdateReviewFields: (keyof ReviewProps)[] = [
  "title",
  "rating",
  "comment",
];

export const REVIEW_POPULATE_FIELDS: ReviewPopulateFieldsProps = {
  user: [
    "firstName",
    "lastName",
    "phoneNumber",
    "email",
    "profilePic",
    "createdAt",
    "updatedAt",
  ],
};
