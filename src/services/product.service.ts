import { AppError } from "../constructors";
import { Category } from "../models";
import { createCategoryValidationSchema } from "../validations/product/category.validation";

export const findOrCreateCategory = async (
  name: string,
  level: number,
  parentCategory: string | null
) => {
  const { error } = createCategoryValidationSchema.validate({
    name,
    level,
    parentCategory,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new AppError(errorMessage, 400);
  }

  let category = await Category.findOne({ name, parentCategory });

  if (!category) {
    category = await Category.create({ name, parentCategory, level });
  }

  return category;
};
