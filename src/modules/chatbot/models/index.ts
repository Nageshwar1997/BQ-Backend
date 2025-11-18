import { model } from "mongoose";
import { embeddedProduct } from "../schemas";

export const EmbeddedProduct = model("Embedded-Product", embeddedProduct);
