import { Router } from "express";
import { uploadProduct } from "../controllers/product/product.controller";
import upload from "../configs/upload.multer.config";
import isAuthorized from "../middlewares/authorization.middleware";

const productRouter = Router();
productRouter.post(
  "/upload",
  upload.any(),
  isAuthorized(["ADMIN", "MASTER", "SELLER"]),
  uploadProduct
);

export default productRouter;
