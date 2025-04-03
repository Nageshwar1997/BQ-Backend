import { Router } from "express";
import {
  addProduct,
  getProductsByCategory,
} from "../controllers/product/product.controller";

const productRouter = Router();

productRouter.post("/", addProduct);
productRouter.get("/all", getProductsByCategory);

export default productRouter;
