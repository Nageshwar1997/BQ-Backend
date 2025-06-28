import { Router } from "express";

import {
  deleteProductController,
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
  RequestMiddleware.checkEmptyRequest({ filesOrBody: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: [
      "removingShadeImageUrls",
      "removingCommonImageURLs",
      "categoryLevelOne",
      "categoryLevelTwo",
      "categoryLevelThree",
      "removingShades",
      "newAddedShades",
      "updatedShadeWithFiles",
      "updatedShadeWithoutFiles",
      "removedQuillImageURLs",
    ],
  }),
  ZodMiddleware.validateZodSchema(updateProductZodSchema),
  ResponseMiddleware.catchAsync(updateProductController)
);

productRouter.delete(
  "/product/delete/:productId",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  ResponseMiddleware.catchAsync(deleteProductController)
);
