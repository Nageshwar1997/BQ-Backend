import { Router } from "express";
import { Middlewares, ZodMiddleware } from "../../../Middlewares";
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
  Middlewares.Response.Async.TryCatchWithSession(addAddressController),
);
addressRouter.patch(
  "/update/:addressId",
  Middlewares.Request.Empty({ body: true, params: true }),
  ZodMiddleware.validateZodSchema(updateAddressSchema),
  Middlewares.Response.Async.TryCatchWithSession(updateAddressController),
);

addressRouter.delete(
  "/remove/:addressId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Response.Async.TryCatchWithSession(removeAddressController),
);

// User Address Routes
addressRouter.get(
  "/",
  Middlewares.Response.Async.TryCatch(getUserAddressesController),
);
