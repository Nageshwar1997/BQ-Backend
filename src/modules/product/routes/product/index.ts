import { Router } from "express";

import {
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  uploadProductController,
} from "../../controllers";
import {
  Middlewares,
  MulterMiddleware,
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
  Middlewares.Request.Empty({ body: true, files: true }),
  Middlewares.JSONParser({
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
  Middlewares.Request.Empty({ params: true }),
  ResponseMiddleware.catchAsync(getProductByIdController),
);

productRouter.patch(
  "/product/update/:productId",
  Middlewares.Auth.Authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  Middlewares.Request.Empty({ filesOrBody: true }),
  Middlewares.JSONParser({
    fieldsToParse: POSSIBLE_PARSED_FIELDS,
  }),
  ZodMiddleware.validateZodSchema(updateProductZodSchema),
  ResponseMiddleware.catchAsync(updateProductController),
);

productRouter.delete(
  "/product/delete/:productId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Auth.Authorization(["ADMIN", "MASTER", "SELLER"]),
  ResponseMiddleware.catchAsync(deleteProductController),
);
