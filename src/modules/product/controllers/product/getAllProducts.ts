import { Request, Response } from "express";
import { Product, Category } from "../../models";
import { ProductPopulateFieldsProps } from "../../types";
import {
  POSSIBLE_PRODUCT_REQUIRED_FIELDS,
  PRODUCT_POPULATE_FIELDS,
} from "../../constants";
import { isSafePopulateField } from "../../utils";
import { AppError } from "../../../../classes";

export const getAllProductsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = page && limit ? (page - 1) * limit : 0;

  const { populateFields = {}, requiredFields = [] } = req.body ?? {};
  const { category_1, category_2, category_3 } = req.query;

  // --- 1. Handle category filtering logic ---
  let categoryFilter: string[] | null = null;

  if (category_1 || category_2 || category_3) {
    if (!category_1 && (category_2 || category_3)) {
      throw new AppError(
        "category_1 is required when category_2 or category_3 is provided",
        400
      );
    }
    if (category_3 && !category_2) {
      throw new AppError(
        "category_2 is required when category_3 is provided",
        400
      );
    }

    let level3CategoryIds: string[] = [];

    const cat1 = await Category.findOne({
      category: category_1,
      level: 1,
    }).lean();

    if (!cat1) {
      return res.success(200, "Products fetched successfully", {
        products: [],
        totalProducts: 0,
        currentPage: page || 1,
        totalPages: 1,
      });
    }

    if (category_1 && !category_2 && !category_3) {
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

    if (category_1 && category_2 && !category_3) {
      const cat2 = await Category.findOne({
        category: category_2,
        level: 2,
        parentCategory: cat1._id,
      }).lean();

      if (!cat2) {
        return res.success(200, "Products fetched successfully", {
          products: [],
          totalProducts: 0,
          currentPage: page || 1,
          totalPages: 1,
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

    if (category_1 && category_2 && category_3) {
      const cat2 = await Category.findOne({
        category: category_2,
        level: 2,
        parentCategory: cat1._id,
      }).lean();

      if (!cat2) {
        return res.success(200, "Products fetched successfully", {
          products: [],
          totalProducts: 0,
          currentPage: page || 1,
          totalPages: 1,
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
          totalProducts: 0,
          currentPage: page || 1,
          totalPages: 1,
        });
      }

      level3CategoryIds = [cat3._id.toString()];
    }

    categoryFilter = level3CategoryIds;
  }

  // --- 2. Build base query with optional category filter ---
  let query = Product.find(
    categoryFilter ? { category: { $in: categoryFilter } } : {}
  );

  // --- 3. Select specific top-level fields ---
  if (Array.isArray(requiredFields) && requiredFields.length > 0) {
    const safeTopLevelFields = requiredFields.filter((field) =>
      POSSIBLE_PRODUCT_REQUIRED_FIELDS.includes(field)
    );
    query = query.select(safeTopLevelFields.join(" "));
  }

  // --- 4. Populate subDocuments ---
  for (const [path, requestedFields] of Object.entries(populateFields) as [
    keyof ProductPopulateFieldsProps,
    string[]
  ][]) {
    const allowedFields = PRODUCT_POPULATE_FIELDS[path];

    const safeFields = requestedFields.filter(
      (field): field is (typeof allowedFields)[number] =>
        isSafePopulateField(field, allowedFields)
    );

    if (safeFields.length) {
      if (path === "category" && safeFields.includes("parentCategory")) {
        query = query.populate({
          path: "category",
          select: safeFields.join(" "),
          populate: {
            path: "parentCategory",
            select: "name category level",
            populate: {
              path: "parentCategory",
              select: "name category level",
            },
          },
        });
      } else if (path === "reviews") {
        query = query.populate({
          path: "reviews",
          select: safeFields.join(" "),
          ...(safeFields.includes("user") && {
            populate: {
              path: "user",
              select: "-password -role",
            },
          }),
        });
      } else {
        query = query.populate({
          path,
          select: safeFields.join(" "),
        });
      }
    }
  }

  // --- 5. Pagination ---
  if (page && limit) {
    query = query.skip(skip).limit(limit);
  }

  // --- 6. Execute query ---
  const [products, totalProducts] = await Promise.all([
    query.lean(),
    Product.countDocuments(
      categoryFilter ? { category: { $in: categoryFilter } } : {}
    ),
  ]);

  res.success(200, "Products fetched successfully", {
    products,
    totalProducts,
    currentPage: page || 1,
    totalPages: page && limit ? Math.ceil(totalProducts / limit) : 1,
  });
};
