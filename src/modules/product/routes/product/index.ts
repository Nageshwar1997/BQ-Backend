import { Router } from "express";

import {
  getAllProductsController,
  getProductByIdController,
  updateProductController,
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
import {
  updateProductZodSchema,
  uploadProductZodSchema,
} from "../../validations";
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
  RequestMiddleware.checkEmptyRequest({ body: true, file: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: [
      "categoryLevelOne",
      "categoryLevelTwo",
      "categoryLevelThree",
      "shades",
    ],
  }),
  ZodMiddleware.validateZodSchema(updateProductZodSchema),
  ResponseMiddleware.catchAsync(updateProductController)
);
