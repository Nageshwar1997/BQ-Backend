import { Router } from "express";
import {
  uploadProduct,
  getProductsByCategory,
} from "../controllers/product/product.controller";
import isAuthorized from "../middlewares/authorization.middleware";
import upload from "../configs/upload.multer.config";

const productRouter = Router();

productRouter.post(
  "/upload",
  isAuthorized(["ADMIN", "MASTER"]),
  upload.fields([
    { name: "commonImages", maxCount: 10 },
    { name: "shadeImages", maxCount: 20 },
  ]),
  uploadProduct
);
productRouter.get("/all", getProductsByCategory);

export default productRouter;
