import { z } from "zod";
import { validateProductField } from "../../utils";

export const createCategoryZodSchema = (
  parentField: "categoryLevelOne" | "categoryLevelTwo" | "categoryLevelThree",
) => {
  // const commonRequirements = {  };

  const schema = z.object(
    {
      name: validateProductField({
        parentField,
        label: "Name",
        min: 2,
        field: "name",
        blockMultipleSpaces: true,
      }),
      category: validateProductField({
        parentField,
        label: "Category",
        min: 2,
        field: "category",
        blockSingleSpace: true,
      }),
    },
    {
      error: `'${parentField}' must be an object of key-value pairs keys: name, category.`,
    },
  );
  return schema;
};
