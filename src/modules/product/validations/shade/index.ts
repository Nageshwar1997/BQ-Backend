import { z } from "zod";
import { hexColorRegex } from "../../../../constants";
import { validateProductField } from "../../utils";

export const addShadesZodSchema = z.array(
  z.object({
    shadeName: validateProductField({
      field: "shadeName",
      parentField: "shades[some_index]",
      blockMultipleSpaces: true,
      min: 2,
    }),
    colorCode: validateProductField({
      field: "colorCode",
      parentField: "shades[some_index]",
      blockSingleSpace: true,
      min: 4,
      max: 9,
      customRegex: {
        regex: hexColorRegex,
        message: "Color code must be a valid hex color code.",
      },
    }),
    stock: validateProductField({
      field: "stock",
      parentField: "shades[some_index]",
      min: 5,
      mustBeInt: true,
    }),
  })
);
