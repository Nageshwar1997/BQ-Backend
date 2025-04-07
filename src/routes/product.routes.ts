import { Router } from "express";
import { uploadProductController } from "../controllers/product/test.controller";
import upload from "../configs/upload.multer.config";
import isAuthenticated from "../middlewares/authentication.middleware";

const productRouter = Router();
productRouter.post(
  "/upload",
  upload.any(),
  isAuthenticated,
  uploadProductController
);

export default productRouter;
