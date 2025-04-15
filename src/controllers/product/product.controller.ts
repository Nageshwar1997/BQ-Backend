import { NextFunction, Request, Response } from "express";
import { CatchErrorResponse, SuccessResponse } from "../../utils";
import { Category, Product, Shade } from "../../models";
import { AppError } from "../../constructors";
import { AuthorizedRequest } from "../../types";
import { imageRemover, imageUploader } from "../../utils/mediaUploader";
import { uploadProductValidationSchema } from "../../validations/product/product.validation";
import { findOrCreateCategory } from "../../services/product.service";
import { addShadeValidationSchema } from "../../validations/product/shades.validation";

export const uploadProduct = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const body = req.body;
    const user = req.user;

    const {
      title,
      brand,
      originalPrice,
      sellingPrice,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      categoryLevelOne,
      categoryLevelTwo,
      categoryLevelThree,
      totalStock,
      shadesData,
    } = {
      title: req.body.title?.trim(),
      brand: req.body.brand?.trim(),
      originalPrice: Number(body.originalPrice.trim()),
      sellingPrice: Number(body.sellingPrice.trim()),
      description: req.body.description?.trim(),
      howToUse: req.body.howToUse?.trim(),
      ingredients: req.body.ingredients?.trim(),
      additionalDetails: req.body.additionalDetails?.trim(),
      categoryLevelOne: req.body.categoryLevelOne?.trim(),
      categoryLevelTwo: req.body.categoryLevelTwo?.trim(),
      categoryLevelThree: req.body.categoryLevelThree?.trim(),
      totalStock: Number(body.totalStock.trim()),
      shadesData:
        typeof req.body.shades === "string"
          ? JSON.parse(req.body.shades)
          : req.body.shades,
    };

    const { error } = uploadProductValidationSchema.validate({
      title,
      brand,
      originalPrice,
      sellingPrice,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      categoryLevelOne,
      categoryLevelTwo,
      categoryLevelThree,
      totalStock,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    let category = null;

    if (categoryLevelOne && categoryLevelTwo && categoryLevelThree) {
      // Find or Create Level-One Category
      const category_1 = await findOrCreateCategory(categoryLevelOne, 1, null);

      // Find or Create Level-Two Category (Parent must be Level-One)
      const category_2 = await findOrCreateCategory(
        categoryLevelTwo,
        2,
        category_1._id.toString()
      );

      // Find or Create Level-Three Category (Parent must be Level-Two)
      const category_3 = await findOrCreateCategory(
        categoryLevelThree,
        3,
        category_2._id.toString()
      );
      category = category_3._id;
    } else {
      throw new AppError("All categories are required", 400);
    }
    const shades = Array.isArray(shadesData) ? shadesData : [shadesData];
    const commonImages: Express.Multer.File[] = [];
    const shadeImagesMap: Record<number, Express.Multer.File[]> = {};

    files?.forEach((file) => {
      if (file.fieldname.startsWith("commonImages")) {
        commonImages.push(file);
      }

      const shadeMatch = file?.fieldname.match(/^shades\[(\d+)\]\[images\]/);
      if (shadeMatch) {
        const shadeIndex = parseInt(shadeMatch[1]);
        if (!shadeImagesMap[shadeIndex]) {
          shadeImagesMap[shadeIndex] = [];
        }
        shadeImagesMap[shadeIndex].push(file);
      }
    });

    // Upload common images
    const uploadedCommonImages = await Promise.all(
      commonImages?.map((file) =>
        imageUploader({
          file,
          folder: `Products/${title}/Common_Images`,
          cloudinaryConfigOption: "product",
        })
      )
    );

    // Upload shade images
    const enrichedShades = await Promise.all(
      shades?.map(async (shade, idx) => {
        const shadeFiles = shadeImagesMap[idx] || [];
        const uploadedShadeImages = await Promise.all(
          shadeFiles?.map((file) =>
            imageUploader({
              file,
              folder: `Products/${title}/Shades/${shade.shadeName}`,
              cloudinaryConfigOption: "product",
            })
          )
        );

        const images = uploadedShadeImages?.map((img) => img.secure_url);

        return {
          ...shade,
          stock: Number(shade.stock),
          images,
        };
      })
    );

    if (enrichedShades?.length > 0) {
      const { error } = addShadeValidationSchema.validate(enrichedShades);
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        throw new AppError(errorMessage, 400);
      }
    }

    const newShadeIds = await Promise.all(
      enrichedShades?.map(async (shade) => {
        const newShade = await Shade.create(shade);
        return newShade._id;
      })
    );

    const finalData = {
      title,
      brand,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      category,
      discount: Math.round(
        ((originalPrice - sellingPrice) / originalPrice) * 100
      ),
      seller: user?._id,
      originalPrice,
      sellingPrice,
      commonImages: uploadedCommonImages.map((img) => img.secure_url),
      shades: newShadeIds,
      totalStock,
    };

    try {
      const product = await Product.create(finalData);

      SuccessResponse(res, 200, "Product uploaded successfully", {
        product,
      });
    } catch (error) {
      // Rollback: Remove uploaded common images
      await Promise.all(
        uploadedCommonImages.map((img) =>
          imageRemover(img.secure_url, "product")
        )
      );

      // Rollback: Remove uploaded shades
      await Shade.deleteMany({
        _id: { $in: newShadeIds },
      });

      // Rollback: Remove uploaded shade images
      await Promise.all(
        enrichedShades?.map((shade) =>
          Promise.all(
            shade?.images?.map((img: string) => imageRemover(img, "product"))
          )
        )
      );

      throw new AppError("Failed to upload product", 400);
    }
  } catch (error) {
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
    return CatchErrorResponse(error, next);
  }
};
