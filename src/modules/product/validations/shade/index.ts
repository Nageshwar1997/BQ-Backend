import { z } from "zod";
import { constants } from "../../../../constants";
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
        label: "Shade name",
        parentField,
        blockMultipleSpaces: true,
        min: 2,
        isOptional,
      }),
      colorCode: validateProductField({
        field: "colorCode",
        label: "Color code",
        parentField,
        blockSingleSpace: true,
        min: 4,
        max: 9,
        isOptional: true,
        customRegexes: [
          {
            regex: constants.common.regex.HEX_CODE,
            message: "Color code must be a valid hex color code.",
          },
        ],
      }),
      stock: validateProductField({
        field: "stock",
        label: "Stock",
        parentField,
        min: 5,
        isOptional,
        mustBeInt: true,
      }),
    }),
  );
};
