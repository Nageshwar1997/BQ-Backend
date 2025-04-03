import { Router } from "express";
import authRouter from "./auth.routes";
import blogRouter from "./blog.routes";
import mediaRouter from "./mediaFiles.routes";
import userRouter from "./user.routes";
import productRouter from "./product.routes";

const router = Router();

// Auth routes
router.use("/auth", authRouter);

// User routes
router.use("/user", userRouter);

// Media routes
router.use("/media", mediaRouter);

// Blog routes
router.use("/blogs", blogRouter);

router.use("/products", productRouter);

export default router;
