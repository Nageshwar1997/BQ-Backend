import { Router } from "express";
import { addAddressController } from "../controllers/addAddress";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { addAddressSchema } from "../validations";
import { getUserAddressesController } from "../controllers/getUserAddresses";

export const addressRouter = Router();

// Address Routes
addressRouter.post(
  "/add",
  AuthMiddleware.authenticated,
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(addAddressSchema),
  ResponseMiddleware.catchAsyncWithTransaction(addAddressController)
);

// User Address Routes
addressRouter.get(
  "/",
  AuthMiddleware.authenticated,
  ResponseMiddleware.catchAsync(getUserAddressesController)
);
