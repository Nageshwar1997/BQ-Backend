import { z } from "zod";
import { validateZodNumber } from "../../../utils";

export const updateCartProductQuantityZodSchema = z.object({
  quantity: validateZodNumber({
    field: "quantity",
    label: "Quantity",
    mustBeInt: true,
    max: 5,
    min: 1,
  }),
});
