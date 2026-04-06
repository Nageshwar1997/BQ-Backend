import { Router } from "express";
import {
  Middlewares,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../Middlewares";
import { addAddressSchema, updateAddressSchema } from "../validations";
import {
  addAddressController,
  getUserAddressesController,
  removeAddressController,
  updateAddressController,
} from "../controllers";

export const addressRouter = Router();

addressRouter.use(Middlewares.Auth.Authenticated(false));

// Address Routes
addressRouter.post(
  "/add",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(addAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(addAddressController),
);
addressRouter.patch(
  "/update/:addressId",
  RequestMiddleware.checkEmptyRequest({ body: true, params: true }),
  ZodMiddleware.validateZodSchema(updateAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(updateAddressController),
);

addressRouter.delete(
  "/remove/:addressId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(removeAddressController),
);

// User Address Routes
addressRouter.get(
  "/",
  ResponseMiddleware.catchAsync(getUserAddressesController),
);
