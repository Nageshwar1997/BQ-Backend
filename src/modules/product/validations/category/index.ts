import { z } from "zod";
import { validateProductField } from "../../utils";

export const createCategoryZodSchema = (
  parentField: "categoryLevelOne" | "categoryLevelTwo" | "categoryLevelThree"
) => {
  const commonRequirements = { parentField, min: 2 };

  const schema = z.object(
    {
      name: validateProductField({
        ...commonRequirements,
        field: "name",
        blockMultipleSpaces: true,
      }),
      category: validateProductField({
        ...commonRequirements,
        field: "category",
        blockSingleSpace: true,
      }),
    },
    {
      required_error: `'${parentField}' is required.`,
      invalid_type_error: `'${parentField}' must be an object of key-value pairs keys: name, category.`,
    }
  );
  return schema;
};
