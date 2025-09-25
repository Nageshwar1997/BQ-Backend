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
  removeAddressController,
  updateAddressController,
} from "../controllers";

export const addressRouter = Router();

addressRouter.use(AuthMiddleware.authenticated);

// Address Routes
addressRouter.post(
  "/add",
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(addAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(addAddressController)
);
addressRouter.patch(
  "/update/:addressId",
  RequestMiddleware.checkEmptyRequest({ body: true, params: true }),
  ZodMiddleware.validateZodSchema(updateAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(updateAddressController)
);

addressRouter.delete(
  "/remove/:addressId",
  RequestMiddleware.checkEmptyRequest({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(removeAddressController)
);

// User Address Routes
addressRouter.get(
  "/",
  ResponseMiddleware.catchAsync(getUserAddressesController)
);
