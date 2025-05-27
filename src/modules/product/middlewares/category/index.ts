import { NextFunction, Response } from "express";
import { AuthorizedRequest } from "../../../../types";
import { findOrCreateCategory } from "../../services";

export const addCategoryToRequest = async (
  req: AuthorizedRequest,
  _: Response,
  next: NextFunction
) => {
  const { categoryLevelOne, categoryLevelTwo, categoryLevelThree } = req.body;

  const category_1 = await findOrCreateCategory(
    categoryLevelOne.name,
    categoryLevelOne.category,
    null,
    1
  );

  // Find or Create Level-Two Category (Parent must be Level-One)
  const category_2 = await findOrCreateCategory(
    categoryLevelTwo.name,
    categoryLevelTwo.category,
    category_1._id,
    1
  );

  // Find or Create Level-Three Category (Parent must be Level-Two)
  const category_3 = await findOrCreateCategory(
    categoryLevelThree.name,
    categoryLevelThree.category,
    category_2._id,
    3
  );

  req.body.category = category_3._id;

  next();
};
