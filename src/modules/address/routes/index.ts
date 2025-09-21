import { Router } from "express";
import { addAddressController } from "../controllers/addAddress";
import {
  AuthMiddleware,
  RequestMiddleware,
  ResponseMiddleware,
  ZodMiddleware,
} from "../../../middlewares";
import { addAddressSchema } from "../validations";

export const addressRouter = Router();

// Address Routes

addressRouter.post(
  "/add",
  AuthMiddleware.authenticated,
  RequestMiddleware.checkEmptyRequest({ body: true }),
  ZodMiddleware.validateZodSchema(addAddressSchema),
  ResponseMiddleware.catchAsync(addAddressController)
);

// User Address Routes
