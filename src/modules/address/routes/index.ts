import { Router } from "express";
import { Middlewares } from "../../../Middlewares";
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
  Middlewares.Zod(addAddressSchema),
  Middlewares.Response.Async.TryCatchWithSession(addAddressController),
);
addressRouter.patch(
  "/update/:addressId",
  Middlewares.Request.Empty({ body: true, params: true }),
  Middlewares.Zod(updateAddressSchema),
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
