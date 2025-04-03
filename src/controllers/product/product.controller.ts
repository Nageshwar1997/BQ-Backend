import { NextFunction, Request, Response } from "express";
import { CatchErrorResponse, SuccessResponse } from "../../utils";
import { Category, Product } from "../../models";
import { AppError } from "../../constructors";

const findOrCreateCategory = async (
  name: string,
  parentCategory: string | null
) => {
  let category = await Category.findOne({ name, parentCategory });

  if (!category) {
    category = await Category.create({ name, parentCategory });
  }

  return category;
};

export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, levelOne, levelTwo, levelThree } = req.body;

    // Find or Create Level-One Category
    const levelOneCategory = await findOrCreateCategory(levelOne, null);

    // Find or Create Level-Two Category (Parent must be Level-One)
    const levelTwoCategory = await findOrCreateCategory(
      levelTwo,
      levelOneCategory._id.toString()
    );

    // Find or Create Level-Three Category (Parent must be Level-Two)
    const levelThreeCategory = await findOrCreateCategory(
      levelThree,
      levelTwoCategory._id.toString()
    );

    // Create the product with levelThree category
    const product = new Product({
      title,
      category: levelThreeCategory._id,
    });

    await product.save();

    console.log("PRODUCT", product);
    SuccessResponse(res, 201, "Product added successfully", { product });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const findProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { levelOne, levelTwo, levelThree } = req.body;

    // Step 1: Find Level-One Category
    const levelOneCategory = await Category.findOne({ name: levelOne });
    if (!levelOneCategory) {
      throw new AppError("Level-One category not found", 404);
    }

    let categoryIds: string[] = [levelOneCategory._id.toString()];

    // Step 2: Prevent fetching Level-Three without Level-Two
    if (levelThree && !levelTwo) {
      throw new AppError(
        "Level-Two category is required to fetch Level-Three products",
        400
      );
    }

    if (levelTwo) {
      // Step 3: Find Level-Two Category under Level-One
      const levelTwoCategory = await Category.findOne({
        name: levelTwo,
        parentCategory: levelOneCategory._id,
      });

      if (!levelTwoCategory) {
        throw new AppError("Level-Two category not found under Level-One", 404);
      }

      categoryIds.push(levelTwoCategory._id.toString());

      if (levelThree) {
        // Step 4: Find Level-Three Category under Level-Two
        const levelThreeCategory = await Category.findOne({
          name: levelThree,
          parentCategory: levelTwoCategory._id,
        });

        if (!levelThreeCategory) {
          throw new AppError(
            "Level-Three category not found under Level-Two",
            404
          );
        }

        categoryIds.push(levelThreeCategory._id.toString());
      } else {
        // Step 5: If Level-Three is not provided, get all Level-Three categories under Level-Two
        const levelThreeCategories = await Category.find({
          parentCategory: levelTwoCategory._id,
        });

        const levelThreeCategoryIds = levelThreeCategories.map((cat) =>
          cat._id.toString()
        );
        categoryIds.push(...levelThreeCategoryIds);
      }
    } else {
      // Step 6: If Level-Two is not provided, get all Level-Two categories under Level-One
      const levelTwoCategories = await Category.find({
        parentCategory: levelOneCategory._id,
      });
      const levelTwoCategoryIds = levelTwoCategories.map((cat) =>
        cat._id.toString()
      );

      // Step 7: Get all Level-Three categories under the fetched Level-Two categories
      const levelThreeCategories = await Category.find({
        parentCategory: { $in: levelTwoCategoryIds },
      });
      const levelThreeCategoryIds = levelThreeCategories.map((cat) =>
        cat._id.toString()
      );

      // Include Level-Two and Level-Three category IDs for product search
      categoryIds.push(...levelTwoCategoryIds, ...levelThreeCategoryIds);
    }

    // Step 8: Fetch Products with Matching Categories and Populate Category Data
    const products = await Product.find({ category: { $in: categoryIds } })
      .populate({
        path: "category",
        populate: {
          path: "parentCategory",
          populate: {
            path: "parentCategory", // Recursively populate deeper levels
          },
        },
      })
      .lean();

    SuccessResponse(res, 200, "Products fetched successfully", {
      products,
    });
  } catch (error) {
    console.error(error);
    return CatchErrorResponse(error, next);
  }
};
