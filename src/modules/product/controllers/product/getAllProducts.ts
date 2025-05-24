import { Request, Response } from "express";
import { Product } from "../../models";
import { ProductPopulateFieldsProps } from "../../types";
import { productPopulateFields } from "../../constants";
import { isSafePopulateField } from "../../utils";

export const getAllProductsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = page && limit ? (page - 1) * limit : 0;

  const { populateFields = {} } = req.body;

  // Start building query
  let query = Product.find();

  // Dynamic populate
  for (const [path, requestedFields] of Object.entries(populateFields) as [
    keyof ProductPopulateFieldsProps,
    string[]
  ][]) {
    const allowedFields = productPopulateFields[path];

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

  // Handle pagination
  if (page && limit) {
    query = query.skip(skip).limit(limit);
  }

  const products = await query.lean();

  const totalProducts = await Product.countDocuments();

  res.success(200, "Products fetched successfully", {
    products,
    totalProducts,
    currentPage: page || 1,
    totalPages: page && limit ? Math.ceil(totalProducts / limit) : 1,
  });
};
