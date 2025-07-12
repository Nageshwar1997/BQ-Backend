import { z } from "zod";
import { regexes } from "../../../../constants";
import { validateProductField } from "../../utils";
import { validateZodString } from "../../../../utils";

export const addShadesZodSchema = ({
  isOptional,
  _idOptional,
  parentField = "shades[some_index]",
}: {
  isOptional: boolean;
  _idOptional: boolean;
  parentField?: string;
}) => {
  return z.array(
    z.object({
      _id: validateZodString({
        field: "_id",
        parentField,
        blockSingleSpace: true,
        isOptional: _idOptional,
      }),
      shadeName: validateProductField({
        field: "shadeName",
        parentField,
        blockMultipleSpaces: true,
        min: 2,
        isOptional,
      }),
      colorCode: validateProductField({
        field: "colorCode",
        parentField,
        blockSingleSpace: true,
        min: 4,
        max: 9,
        isOptional,
        customRegex: {
          regex: regexes.validHexColorCode,
          message: "Color code must be a valid hex color code.",
        },
      }),
      stock: validateProductField({
        field: "stock",
        parentField,
        min: 5,
        isOptional,
        mustBeInt: true,
      }),
    })
  );
};
