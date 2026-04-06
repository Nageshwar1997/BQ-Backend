import { Router } from "express";
import {
  BlogModule,
  CartModule,
  CartProductModule,
  MediaModule,
  Modules,
  OrderModule,
  ProductModule,
  ReviewModule,
  UserModule,
  WebhookModule,
} from "../Modules";

const router = Router();

// Auth routes
router.use("/auth", Modules.Auth.Router);

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
router.use("/addresses", Modules.Address.Router);

// Order routes
router.use("/orders", OrderModule.Routes.orderRouter);

// Webhook routes
router.use("/webhook", WebhookModule.Routes.webhookRouter);

export default router;
