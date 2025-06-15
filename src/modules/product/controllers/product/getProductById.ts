import { Request, Response } from "express";
import { Product } from "../../models";
import { ProductPopulateFieldsProps } from "../../types";
import { productPopulateFields } from "../../constants";
import { isSafePopulateField } from "../../utils";
import { isValidMongoId } from "../../../../utils";

export const getProductByIdController = async (req: Request, res: Response) => {
  const { populateFields = {} } = req.body ?? {};
  const { productId } = req.params;

  isValidMongoId(productId, "Invalid Product Id provided", 404);

  // Start building query
  let query = Product.findById(productId);

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

  const product = await query.lean();

  res.success(200, "Product fetched successfully", { product });
};
