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
import { POSSIBLE_PARSED_FIELDS } from "../../constants";

export const productRouter = Router();

productRouter.post(
  "/upload",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  RequestMiddleware.checkEmptyRequest({ body: true, files: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: POSSIBLE_PARSED_FIELDS,
  }),
  ZodMiddleware.validateZodSchema(uploadProductZodSchema),
  ResponseMiddleware.catchAsync(uploadProductController)
);

productRouter.get(
  "/all",
  ResponseMiddleware.catchAsync(getAllProductsController)
);

productRouter.get(
  "/product/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsync(getProductByIdController)
);

productRouter.patch(
  "/product/update/:productId",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  RequestMiddleware.checkEmptyRequest({ filesOrBody: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: POSSIBLE_PARSED_FIELDS,
  }),
  ZodMiddleware.validateZodSchema(updateProductZodSchema),
  ResponseMiddleware.catchAsync(updateProductController)
);

productRouter.delete(
  "/product/delete/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  ResponseMiddleware.catchAsync(deleteProductController)
);
