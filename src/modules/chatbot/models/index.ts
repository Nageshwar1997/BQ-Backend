import { model } from "mongoose";
import { embeddedOrderSchema, embeddedProductSchema } from "../schemas";

export const EmbeddedProduct = model("Embedded-Product", embeddedProductSchema);

export const EmbeddedOrder = model("Embedded-Order", embeddedOrderSchema);
