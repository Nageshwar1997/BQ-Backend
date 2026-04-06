import { Router } from "express";
import { Middlewares } from "../../../Middlewares";
import { addAddressSchema, updateAddressSchema } from "../Address.Validations";
import { AddressControllers } from "../Address.Controllers";

export const AddressRouter = Router();

AddressRouter.use(Middlewares.Auth.Authenticated(false));

// Address Routes
AddressRouter.post(
  "/add",
  Middlewares.Request.Empty({ body: true }),
  Middlewares.Zod(addAddressSchema),
  Middlewares.Response.Async.TryCatchWithSession(AddressControllers.AddAddress),
);
AddressRouter.patch(
  "/update/:addressId",
  Middlewares.Request.Empty({ body: true, params: true }),
  Middlewares.Zod(updateAddressSchema),
  Middlewares.Response.Async.TryCatchWithSession(
    AddressControllers.UpdateAddress,
  ),
);

AddressRouter.delete(
  "/remove/:addressId",
  Middlewares.Request.Empty({ params: true }),
  Middlewares.Response.Async.TryCatchWithSession(
    AddressControllers.RemoveAddress,
  ),
);

// User Address Routes
AddressRouter.get(
  "/",
  Middlewares.Response.Async.TryCatch(AddressControllers.GetUserAddresses),
);
