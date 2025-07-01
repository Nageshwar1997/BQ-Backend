import { Request, Response } from "express";
import { Product, Category } from "../../models";
import { AppError } from "../../../../classes";

export const getProductsByCategoryController = async (
  req: Request,
  res: Response
) => {
  const { category_1, category_2, category_3 } = req.query;

  // Validation for invalid cases
  if (!category_1 && (category_2 || category_3)) {
    throw new AppError(
      "category_1 is required when category_2 or category_3 is provided",
      400
    );
  }

  if (category_2 && !category_3 && typeof category_2 !== "string") {
    throw new AppError("Invalid category_2 value", 400);
  }

  if (category_3 && !category_2) {
    throw new AppError(
      "category_2 is required when category_3 is provided",
      400
    );
  }

  let level3CategoryIds: string[] = [];

  // Case 1: category_1 only
  if (category_1 && !category_2 && !category_3) {
    const cat1 = await Category.findOne({
      category: category_1,
      level: 1,
    }).lean();
    if (!cat1) {
      res.success(200, "Products fetched successfully", { products: [] });
      return;
    }
    const level2List = await Category.find({
      parentCategory: cat1._id,
      level: 2,
    })
      .select("_id")
      .lean();

    const level2Ids = level2List.map((cat) => cat._id);

    const level3List = await Category.find({
      parentCategory: { $in: level2Ids },
      level: 3,
    })
      .select("_id")
      .lean();

    level3CategoryIds = level3List.map((cat) => cat._id.toString());
  }

  // Case 2: category_1 + category_2
  else if (category_1 && category_2 && !category_3) {
    const cat1 = await Category.findOne({
      category: category_1,
      level: 1,
    }).lean();
    if (!cat1) {
      return res.success(200, "Products fetched successfully", {
        products: [],
      });
    }

    const cat2 = await Category.findOne({
      category: category_2,
      level: 2,
      parentCategory: cat1._id,
    }).lean();
    if (!cat2) {
      return res.success(200, "Products fetched successfully", {
        products: [],
      });
    }

    const level3List = await Category.find({
      parentCategory: cat2._id,
      level: 3,
    })
      .select("_id")
      .lean();

    level3CategoryIds = level3List.map((cat) => cat._id.toString());
  }

  // Case 3: category_1 + category_2 + category_3
  else if (category_1 && category_2 && category_3) {
    const cat1 = await Category.findOne({
      category: category_1,
      level: 1,
    }).lean();
    if (!cat1) {
      throw new AppError("category_1 not found", 404);
    }

    const cat2 = await Category.findOne({
      category: category_2,
      level: 2,
      parentCategory: cat1._id,
    }).lean();
    if (!cat2) {
      return res.success(200, "Products fetched successfully", {
        products: [],
      });
    }

    const cat3 = await Category.findOne({
      category: category_3,
      level: 3,
      parentCategory: cat2._id,
    }).lean();

    if (!cat3) {
      return res.success(200, "Products fetched successfully", {
        products: [],
      });
    }
    level3CategoryIds = [cat3._id.toString()];
  }

  if (!level3CategoryIds.length) {
    return res.success(200, "Products fetched successfully", {
      products: [],
    });
  }

  const products = await Product.find({
    category: { $in: level3CategoryIds },
  })
    .populate({
      path: "category",
      select: "name category",
      populate: {
        path: "parentCategory",
        select: "name category",
        populate: {
          path: "parentCategory",
          select: "name category",
        },
      },
    })
    .populate("shades")
    .lean();

  res.success(200, "Products fetched successfully", { products });
};
