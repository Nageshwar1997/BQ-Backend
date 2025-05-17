import { Types } from "mongoose";

import { Classes } from "../../../../shared";
import { Category } from "../../models";
import { createCategoryJoiSchema } from "../../validations";

export const createCategory = async (
  name: string,
  level: number,
  parentCategory: Types.ObjectId | string | null
) => {
  try {
    const { error } = createCategoryJoiSchema.validate({
      name,
      level,
      parentCategory,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new Classes.AppError(errorMessage, 400);
    }

    const category = await Category.create({ name, parentCategory, level });
    return category;
  } catch (error) {
    throw error;
  }
};

export const getCategoryByNameAndParentId = async (
  name: string,
  parentCategory: Types.ObjectId | string | null
) => {
  try {
    const category = await Category.findOne({ name, parentCategory });
    return category;
  } catch (error) {
    throw error;
  }
};

export const findOrCreateCategory = async (
  name: string,
  level: number,
  parentCategory: Types.ObjectId | string | null
) => {
  try {
    let category = await getCategoryByNameAndParentId(name, parentCategory);

    if (!category) {
      category = await createCategory(name, level, parentCategory);
    }

    return category;
  } catch (error) {
    throw error;
  }
};
