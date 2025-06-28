import { Router } from "express";
import {
  AuthModule,
  BlogModule,
  MediaModule,
  ProductModule,
  ReviewModule,
  UserModule,
} from "../modules";

const router = Router();

// Auth routes
router.use("/auth", AuthModule.Routes.authRouter);

// User routes
router.use("/users", UserModule.Routes.userRouter);

// Media routes
router.use("/media", MediaModule.Routes.mediaRouter);

// Blog routes
router.use("/blogs", BlogModule.Routes.blogRouter);

// Product routes
router.use("/products", ProductModule.Routes.productRouter);

// Review routes
router.use("/reviews", ReviewModule.Routes.reviewRouter);

export default router;
