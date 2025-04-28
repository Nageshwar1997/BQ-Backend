import { Router } from "express";

import {
  getAllProductsController,
  uploadProductController,
} from "../../controllers";
import {
  AuthMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
} from "../../../../middlewares";

export const productRouter = Router();

productRouter.post(
  "/upload",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  ResponseMiddleware.catchAsync(uploadProductController)
);

productRouter.post(
  "/all",
  ResponseMiddleware.catchAsync(getAllProductsController)
);
