import { Router } from "express";
import {
  AuthModule,
  BlogModule,
  CartModule,
  CartProductModule,
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

// Cart routes
router.use("/cart", CartModule.Routes.cartRouter);

// Cart Product Routes
router.use("/cart-product", CartProductModule.Routes.cartProductRouter);

export default router;
