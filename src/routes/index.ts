import { Router } from "express";
import {
  AddressModule,
  AuthModule,
  BlogModule,
  CartModule,
  CartProductModule,
  MediaModule,
  OrderModule,
  ProductModule,
  ReviewModule,
  UserModule,
} from "../modules";
import { chatRouter } from "../modules/chatbot/routes";

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
router.use("/carts", CartModule.Routes.cartRouter);

// Cart Product Routes
router.use("/cart-products", CartProductModule.Routes.cartProductRouter);

// Address routes
router.use("/addresses", AddressModule.Routes.addressRouter);

// Order routes
router.use("/orders", OrderModule.Routes.orderRouter);
router.use("/chatbot", chatRouter);

export default router;
