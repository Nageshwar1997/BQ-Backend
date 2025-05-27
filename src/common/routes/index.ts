import { Router } from "express";
import { MediaModule } from "../../modules";

// import {
//   AuthModule,
//   BlogModule,
//   MediaModule,
//   ProductModule,
//   UserModule,
// } from "../modules";

export const router = Router();

// // Auth routes
// router.use("/auth", AuthModule.Routes.authRouter);

// // User routes
// router.use("/users", UserModule.Routes.userRouter);

// Media routes
router.use("/media", MediaModule.Routes.router);

// // Blog routes
// router.use("/blogs", BlogModule.Routes.blogRouter);

// // Product routes
// router.use("/products", ProductModule.Routes.productRouter);
