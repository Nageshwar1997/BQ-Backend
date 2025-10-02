import { z } from "zod";
import { validateZodNumber } from "../../../utils";

export const updateCartProductQuantityZodSchema = z.object({
  quantity: validateZodNumber({
    field: "quantity",
    mustBeInt: true,
    max: 5,
    min: 1,
  }),
});
