import { Router } from "express";

import {
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  uploadProductController,
} from "../../controllers";
import {
  JSONParseMiddleware,
  Middlewares,
  MulterMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../../Middlewares";
import {
  updateProductZodSchema,
  uploadProductZodSchema,
} from "../../validations";
import { POSSIBLE_PARSED_FIELDS } from "../../constants";

export const productRouter = Router();

productRouter.post(
  "/upload",
  Middlewares.Auth.Authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  RequestMiddleware.checkEmptyRequest({ body: true, files: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: POSSIBLE_PARSED_FIELDS,
  }),
  ZodMiddleware.validateZodSchema(uploadProductZodSchema),
  ResponseMiddleware.catchAsync(uploadProductController),
);

productRouter.get(
  "/all",
  ResponseMiddleware.catchAsync(getAllProductsController),
);

productRouter.get(
  "/product/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsync(getProductByIdController),
);

productRouter.patch(
  "/product/update/:productId",
  Middlewares.Auth.Authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  RequestMiddleware.checkEmptyRequest({ filesOrBody: true }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: POSSIBLE_PARSED_FIELDS,
  }),
  ZodMiddleware.validateZodSchema(updateProductZodSchema),
  ResponseMiddleware.catchAsync(updateProductController),
);

productRouter.delete(
  "/product/delete/:productId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  Middlewares.Auth.Authorization(["ADMIN", "MASTER", "SELLER"]),
  ResponseMiddleware.catchAsync(deleteProductController),
);
