import { Router } from "express";
import {
  getAllProducts,
  uploadProduct,
} from "../controllers/product/product.controller";
import upload from "../configs/upload.multer.config";
import isAuthorized from "../middlewares/authorization.middleware";

const productRouter = Router();

productRouter.post(
  "/upload",
  upload.any(),
  isAuthorized(["ADMIN", "MASTER", "SELLER"]),
  uploadProduct
);

productRouter.post("/all", getAllProducts);

export default productRouter;
