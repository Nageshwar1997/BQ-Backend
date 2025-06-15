import { Router } from "express";

import {
  getAllProductsController,
  getProductByIdController,
  uploadProductController,
} from "../../controllers";
import {
  AuthMiddleware,
  JSONParseMiddleware,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../../middlewares";
import { uploadProductZodSchema } from "../../validations";
import { addCategoryToRequest, addShadesToRequest } from "../../middlewares";

export const productRouter = Router();

productRouter.post(
  "/upload",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  RequestMiddleware.checkEmptyRequest({ body: true, files: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: [
      "categoryLevelOne",
      "categoryLevelTwo",
      "categoryLevelThree",
      "shades",
    ],
  }),
  ZodMiddleware.validateZodSchema(uploadProductZodSchema),
  ResponseMiddleware.catchAsync(addCategoryToRequest), // Add Category to Request
  ResponseMiddleware.catchAsync(addShadesToRequest), // Add Shades to Request & and add common images
  ResponseMiddleware.catchAsync(uploadProductController)
);

productRouter.post(
  "/all",
  ResponseMiddleware.catchAsync(getAllProductsController)
);

productRouter.post(
  "/product/:productId",
  ResponseMiddleware.catchAsync(getProductByIdController)
);

productRouter.patch(
  "/product/update/:productId",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  RequestMiddleware.checkEmptyRequest({ body: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: [
      "categoryLevelOne",
      "categoryLevelTwo",
      "categoryLevelThree",
      "shades",
    ],
  }),
  (req, res) => {
    console.log(
      "updated-with-files-shades",
      req.body["updated-with-files-shades"]
    );
    // console.log("req.body", req.body);
    console.log("req.files", req.files);
    console.log("req.params", req.params);
    console.log("req.query", req.query);
    console.log("req.file", req.file);
    res.success(200, "Product updated successfully", req.body);
  }
);
