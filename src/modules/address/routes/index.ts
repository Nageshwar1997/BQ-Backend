import { Router } from "express";
import { addAddressController } from "../controllers/addAddress";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
} from "../../../middlewares";

export const addressRouter = Router();

addressRouter.post(
  "/add",
  AuthMiddleware.authenticated,
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ResponseMiddleware.catchAsync(addAddressController)
);
