import { isValidObjectId, ObjectId } from "mongoose";

export const isValidMongoId = (id: ObjectId | string): boolean => {
  return isValidObjectId(id);
};
