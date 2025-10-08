import { Router } from "express";
import { createOrder } from "../controllers";
import { authenticated } from "../../../middlewares/auth";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
} from "../../../middlewares";

export const orderRouter = Router();

orderRouter.post(
  "/create",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(createOrder)
);
