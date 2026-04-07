import { Router } from "express";

import {
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  uploadProductController,
} from "../../controllers";
import { middlewares } from "../../../../middlewares";
import {
  updateProductZodSchema,
  uploadProductZodSchema,
} from "../../validations";
import { POSSIBLE_PARSED_FIELDS } from "../../constants";

export const productRouter = Router();

productRouter.post(
  "/upload",
  middlewares.auth.authorized(["ADMIN", "MASTER", "SELLER"]),
  middlewares.multer({ type: "any" }),
  middlewares.request.empty({ body: true, files: true }),
  middlewares.toJSON(POSSIBLE_PARSED_FIELDS),
  middlewares.zod(uploadProductZodSchema),
  middlewares.response.async.tryCatch(uploadProductController),
);

productRouter.get(
  "/all",
  middlewares.response.async.tryCatch(getAllProductsController),
);

productRouter.get(
  "/product/:productId",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatch(getProductByIdController),
);

productRouter.patch(
  "/product/update/:productId",
  middlewares.auth.authorized(["ADMIN", "MASTER", "SELLER"]),
  middlewares.multer({ type: "any" }),
  middlewares.request.empty({ filesOrBody: true }),
  middlewares.toJSON(POSSIBLE_PARSED_FIELDS),
  middlewares.zod(updateProductZodSchema),
  middlewares.response.async.tryCatch(updateProductController),
);

productRouter.delete(
  "/product/delete/:productId",
  middlewares.request.empty({ params: true }),
  middlewares.auth.authorized(["ADMIN", "MASTER", "SELLER"]),
  middlewares.response.async.tryCatch(deleteProductController),
);
