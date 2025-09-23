import { Router } from "express";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { addAddressSchema, updateAddressSchema } from "../validations";
import {
  addAddressController,
  getUserAddressesController,
  updateAddressController,
} from "../controllers";

export const addressRouter = Router();

// Address Routes
addressRouter.post(
  "/add",
  AuthMiddleware.authenticated,
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(addAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(addAddressController)
);
addressRouter.patch(
  "/update/:addressId",
  AuthMiddleware.authenticated,
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(updateAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(updateAddressController)
);

// User Address Routes
addressRouter.get(
  "/",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getUserAddressesController)
);
