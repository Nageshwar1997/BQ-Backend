import { Types } from "mongoose";

import { Category } from "../../models";

export const createCategory = async (
  name: string,
  category: string,
  parentCategory: Types.ObjectId | string | null,
  level: number
) => {
  try {
    const cat = await Category.create({
      name,
      parentCategory,
      level,
      category,
    });
    return cat;
  } catch (error) {
    throw error;
  }
};

export const getCategoryByNameAndParentId = async (
  name: string,
  category: string,
  parentCategory: Types.ObjectId | string | null,
  level: number
) => {
  try {
    const cat = await Category.findOne({
      name,
      parentCategory,
      level,
      category,
    }).lean();
    return cat;
  } catch (error) {
    throw error;
  }
};

export const findOrCreateCategory = async (
  name: string,
  category: string,
  parentCategory: Types.ObjectId | string | null,
  level: number
) => {
  try {
    let cat = await getCategoryByNameAndParentId(
      name,
      category,
      parentCategory,
      level
    );

    if (!cat) {
      cat = await createCategory(name, category, parentCategory, level);
    }

    return cat;
  } catch (error) {
    throw error;
  }
};
