import { NextFunction, Request, Response } from "express";
import { CatchErrorResponse, SuccessResponse } from "../../utils";
import { Category, Product, ProductShade } from "../../models";
import { AppError } from "../../constructors";
import { AuthorizedRequest } from "../../types";

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

export const uploadProduct = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      brand,
      sellingPrice,
      originalPrice,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      levelOneCategory,
      levelTwoCategory,
      levelThreeCategory,
    } = {
      title: req.body.title.trim(),
      brand: req.body.brand.trim(),
      sellingPrice: req.body.sellingPrice,
      originalPrice: req.body.originalPrice,
      description: req.body.description.trim(),
      howToUse: req.body.howToUse.trim(),
      ingredients: req.body.ingredients.trim(),
      additionalDetails: req.body.additionalDetails.trim(),
      levelOneCategory: req.body.levelOneCategory.trim().toLowerCase(),
      levelTwoCategory: req.body.levelTwoCategory.trim().toLowerCase(),
      levelThreeCategory: req.body.levelThreeCategory.trim().toLowerCase(),
    };

    const isProductExist = await Product.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (isProductExist) {
      throw new AppError(
        `Product already exists with this title ${title}`,
        400
      );
    }

    // Category creation
    let category = null;

    if (levelOneCategory && levelTwoCategory && levelThreeCategory) {
      // Find or Create Level-One Category
      const category_1 = await findOrCreateCategory(levelOneCategory, null);

      // Find or Create Level-Two Category (Parent must be Level-One)
      const category_2 = await findOrCreateCategory(
        levelTwoCategory,
        category_1._id.toString()
      );

      // Find or Create Level-Three Category (Parent must be Level-Two)
      const category_3 = await findOrCreateCategory(
        levelThreeCategory,
        category_2._id.toString()
      );
      category = category_3._id;
    } else {
      throw new AppError("All categories are required", 400);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // COMMON IMAGES
    const commonImageFiles = files?.["commonImages"] || [];
    const commonImages = commonImageFiles.map(
      (file: Express.Multer.File) => file.path
    );

    // console.log("commonImageFiles", commonImageFiles);
    // console.log("CommonImages", commonImages);
    const shadeFiles = files?.["shadeImages"] || [];
    const shadesData = JSON.parse(req.body.shades || "[]"); // Dynamically parsed

    // console.log("shadeFiles", shadeFiles);

    const shadeIds = [];
    const imagesPerShade = Math.floor(shadeFiles.length / shadesData.length); // Distribute images equally

    for (let i = 0; i < shadesData.length; i++) {
      const { colorName, colorCode, stock } = shadesData[i];

      // Get images for this shade
      const start = i * imagesPerShade;
      const end = start + imagesPerShade;
      const shadeImages = shadeFiles.slice(start, end).map((file) => file.path);

      console.log("shadeImages", shadeImages);

      const newShade = await ProductShade.create({
        colorName,
        colorCode,
        stock,
        shadeImages,
      });

      shadeIds.push(newShade._id);
    }

    // CLEAN PRODUCT BODY
    const cleanBody = {
      title,
      brand,
      sellingPrice,
      originalPrice,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      category,
      seller: req.user?._id,
      discount: Math.round(
        ((originalPrice - sellingPrice) / originalPrice) * 100
      ),
      commonImages,
      shades: shadeIds,
    };

    const product = await Product.create(cleanBody);

    // console.log("PRODUCT", product);
    SuccessResponse(res, 201, "Product added successfully", { product });
  } catch (error) {
    console.log("ERROR", error);
    return CatchErrorResponse(error, next);
  }
};

export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    const { levelOne, levelTwo, levelThree } = req.body;

    // Step 1: Find Level-One Category
    if (!levelOne) {
      throw new AppError("Level-One category is required", 400);
    }

    const levelOneCategory = await Category.findOne({
      name: levelOne,
    }).lean();

    if (!levelOneCategory) {
      SuccessResponse(res, 200, "No products found", { products: [] });
      return;
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
      }).lean();

      if (!levelTwoCategory) {
        SuccessResponse(res, 200, "No products found", { products: [] });
        return;
      }

      categoryIds.push(levelTwoCategory._id.toString());

      if (levelThree) {
        // Step 4: Find Level-Three Category under Level-Two
        const levelThreeCategory = await Category.findOne({
          name: levelThree,
          parentCategory: levelTwoCategory._id,
        }).lean();

        if (!levelThreeCategory) {
          SuccessResponse(res, 200, "No products found", { products: [] });
          return;
        }

        categoryIds.push(levelThreeCategory._id.toString());
      } else {
        // Step 5: If Level-Three is not provided, get all Level-Three categories under Level-Two
        const levelThreeCategories = await Category.find({
          parentCategory: levelTwoCategory._id,
        }).lean();

        const levelThreeCategoryIds = levelThreeCategories.map((cat) =>
          cat._id.toString()
        );
        categoryIds.push(...levelThreeCategoryIds);
      }
    } else {
      // Step 6: If Level-Two is not provided, get all Level-Two categories under Level-One
      const levelTwoCategories = await Category.find({
        parentCategory: levelOneCategory._id,
      }).lean();
      const levelTwoCategoryIds = levelTwoCategories.map((cat) =>
        cat._id.toString()
      );

      // Step 7: Get all Level-Three categories under the fetched Level-Two categories
      const levelThreeCategories = await Category.find({
        parentCategory: { $in: levelTwoCategoryIds },
      }).lean();
      const levelThreeCategoryIds = levelThreeCategories.map((cat) =>
        cat._id.toString()
      );

      // Include Level-Two and Level-Three category IDs for product search
      categoryIds.push(...levelTwoCategoryIds, ...levelThreeCategoryIds);
    }

    // Step 8: Fetch Products with Matching Categories and Populate Category Data
    let products = null;

    if (page && limit) {
      products = await Product.find({
        category: { $in: categoryIds },
      })
        .populate({
          path: "category",
          populate: {
            path: "parentCategory",
            populate: {
              path: "parentCategory", // Recursively populate deeper levels
            },
          },
        })
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      products = await Product.find({
        category: { $in: categoryIds },
      })
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
    }

    const totalProducts = await Product.countDocuments({
      category: { $in: categoryIds },
    }).lean();

    SuccessResponse(res, 200, "Products fetched successfully", {
      products,
      totalProducts,
      currentPage: page ? page : 1,
      totalPages: page && limit ? Math.ceil(totalProducts / limit) : 1,
    });
  } catch (error) {
    console.error(error);
    return CatchErrorResponse(error, next);
  }
};
