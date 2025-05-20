import { z } from "zod";
import { validateCategoryField } from "../../utils";

const createCategorySchema = (
  field: "categoryLevelOne" | "categoryLevelTwo" | "categoryLevelThree"
) => {
  const commonRequirements = {
    parentField: field,
    nonEmpty: true,
    min: 2,
  };

  return z.object(
    {
      name: validateCategoryField({
        ...commonRequirements,
        field: "name",
        blockMultipleSpaces: true,
      }),
      category: validateCategoryField({
        ...commonRequirements,
        field: "category",
        blockSingleSpace: true,
      }),
    },
    {
      required_error: `'${field}' is required.`,
      invalid_type_error: `'${field}' must be an object of key-value pairs keys: name, category.`,
    }
  );
};

export const createCategoryZodSchema = z.object({
  categoryLevelOne: createCategorySchema("categoryLevelOne"),
  categoryLevelTwo: createCategorySchema("categoryLevelTwo"),
  categoryLevelThree: createCategorySchema("categoryLevelThree"),
});
