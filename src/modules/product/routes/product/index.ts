import { Router } from "express";

import {
  getAllProductsController,
  uploadProductController,
} from "../../controllers";
import {
  AuthMiddleware,
  JSONParseMiddleware,
  MulterMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../../middlewares";
import {
  addShadeZodSchema,
  createCategoryZodSchema,
  uploadProductZodSchema,
} from "../../validations";
import { addCategoryToRequest, addShadesToRequest } from "../../middlewares";

export const productRouter = Router();

productRouter.post(
  "/upload",
  AuthMiddleware.authorization(["ADMIN", "MASTER", "SELLER"]),
  MulterMiddleware.validateFiles({ type: "any" }),
  JSONParseMiddleware.JSONParse({
    fieldsToParse: [
      "categoryLevelOne",
      "categoryLevelTwo",
      "categoryLevelThree",
      "shades",
    ],
  }),
  ZodMiddleware.validateZodSchema(createCategoryZodSchema),
  ResponseMiddleware.catchAsync(addCategoryToRequest), // Add Category to Request
  ZodMiddleware.validateZodSchema(addShadeZodSchema),
  ResponseMiddleware.catchAsync(addShadesToRequest), // Add Shades to Request & and add common images
  ZodMiddleware.validateZodSchema(uploadProductZodSchema),
  ResponseMiddleware.catchAsync(uploadProductController)
);

productRouter.post(
  "/all",
  ResponseMiddleware.catchAsync(getAllProductsController)
);
