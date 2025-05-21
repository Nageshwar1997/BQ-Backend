import { z } from "zod";
import { validateZodNumber, validateZodString } from "../../../../utils";
import { validateShadeField } from "../../utils/shade";

export const addShadeZodSchema = z.object({
  shades: z
    .array(
      z.object({
        shadeName: validateShadeField({
          field: "shadeName",
          parentField: "shades[some_index]",
          blockMultipleSpaces: true,
          nonEmpty: true,
          min: 2,
        }),
        colorCode: validateShadeField({
          field: "colorCode",
          parentField: "shades[some_index]",
          blockSingleSpace: true,
          nonEmpty: true,
          min: 4,
          customRegex: {
            regex:
              /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
            message: "Color code must be a valid hex color code.",
          },
        }),
        stock: validateShadeField({
          field: "stock",
          parentField: "shades[some_index]",
          min: 5,
          mustBeInt: true,
        }),
      })
    )
    .optional()
    .default([]),
  title: validateZodString({
    field: "title",
    blockMultipleSpaces: true,
    nonEmpty: true,
    min: 2,
  }),
});
