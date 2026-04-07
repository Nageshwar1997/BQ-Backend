import { Router } from "express";
import { middlewares } from "../../middlewares";
import { addAddressSchema, updateAddressSchema } from "./validations";
import { addressControllers } from "./controllers";

export const addressRouter = Router();

addressRouter.use(middlewares.auth.authenticated(false));

// Address Routes
addressRouter.post(
  "/add",
  middlewares.request.empty({ body: true }),
  middlewares.zod(addAddressSchema),
  middlewares.response.async.tryCatchWithSession(addressControllers.add),
);
addressRouter.patch(
  "/update/:addressId",
  middlewares.request.empty({ body: true, params: true }),
  middlewares.zod(updateAddressSchema),
  middlewares.response.async.tryCatchWithSession(addressControllers.update),
);

addressRouter.delete(
  "/remove/:addressId",
  middlewares.request.empty({ params: true }),
  middlewares.response.async.tryCatchWithSession(addressControllers.delete),
);

// User Address Routes
addressRouter.get(
  "/",
  middlewares.response.async.tryCatch(addressControllers.get),
);
