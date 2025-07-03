import { Request, Response } from "express";
import { Product } from "../../models";
import { ProductPopulateFieldsProps } from "../../types";
import {
  POSSIBLE_PRODUCT_REQUIRED_FIELDS,
  PRODUCT_POPULATE_FIELDS,
} from "../../constants";
import { isSafePopulateField } from "../../utils";

export const getAllProductsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = page && limit ? (page - 1) * limit : 0;

  const { populateFields = {}, requiredFields = [] } = req.body ?? {};

  // Start building query
  let query = Product.find();

  // --- 1. Handle top-level selected fields ---
  if (Array.isArray(requiredFields) && requiredFields.length > 0) {
    const safeTopLevelFields = requiredFields.filter((field) =>
      POSSIBLE_PRODUCT_REQUIRED_FIELDS.includes(field)
    );
    query = query.select(safeTopLevelFields.join(" "));
  }

  // --- 2. Handle population of subdocuments ---
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
      } else {
        query = query.populate({
          path,
          select: safeFields.join(" "),
        });
      }
    }
  }

  // --- 3. Pagination ---
  if (page && limit) {
    query = query.skip(skip).limit(limit);
  }

  // --- 4. Execute query ---
  const products = await query.lean();

  const totalProducts = await Product.countDocuments();

  res.success(200, "Products fetched successfully", {
    products,
    totalProducts,
    currentPage: page || 1,
    totalPages: page && limit ? Math.ceil(totalProducts / limit) : 1,
  });
};
