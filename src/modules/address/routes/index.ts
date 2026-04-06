import { Router } from "express";
import {
  Middlewares,
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
  Middlewares.Request.Empty({ body: true }),
  ZodMiddleware.validateZodSchema(addAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(addAddressController),
);
addressRouter.patch(
  "/update/:addressId",
  Middlewares.Request.Empty({ body: true, params: true }),
  ZodMiddleware.validateZodSchema(updateAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(updateAddressController),
);

addressRouter.delete(
  "/remove/:addressId",
  Middlewares.Request.Empty({ params: true }),
  ResponseMiddleware.catchAsyncWithTransaction(removeAddressController),
);

// User Address Routes
addressRouter.get(
  "/",
  ResponseMiddleware.catchAsync(getUserAddressesController),
);
