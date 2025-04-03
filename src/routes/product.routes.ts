import { Router } from "express";
import {
  uploadProduct,
  getProductsByCategory,
} from "../controllers/product/product.controller";
import isAuthorized from "../middlewares/authorization.middleware";

const productRouter = Router();

productRouter.post("/upload", isAuthorized(["ADMIN", "MASTER"]), uploadProduct);
productRouter.get("/all", getProductsByCategory);

export default productRouter;
