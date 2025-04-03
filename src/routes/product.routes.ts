import { Router } from "express";
import {
  addProduct,
  findProductsByCategory,
//   getProductsByLevelOne,
} from "../controllers/product/product.controller";

const productRouter = Router();

productRouter.post("/", addProduct);
// productRouter.get("/all", getProductsByLevelOne);
productRouter.get("/all", findProductsByCategory);

export default productRouter;
