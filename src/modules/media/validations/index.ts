import { z } from "zod";
import { allowedOptions } from "../constants";
import {
  validateZodEnums,
  validateZodString,
  validateZodUrl,
} from "../../../utils";

export const cloudinaryConfigOption = validateZodEnums({
  field: "cloudinaryConfigOption",
  enums: allowedOptions,
});

export const removeSingleImageZodSchema = z.object({
  cloudUrl: validateZodUrl({ field: "cloudUrl" }),
  cloudinaryConfigOption: cloudinaryConfigOption,
});

export const removeMultipleImagesZodSchema = z.object({
  cloudUrls: z
    .array(validateZodUrl({ field: "cloudUrls[some_index]" }), {
      error: `The 'cloudUrls' field must be an array of valid URLs.`,
    })
    .nonempty({ message: `The 'cloudUrls' field cannot be empty.` })
    .min(1, { message: `At least 1 'cloudUrl' is required.` }),
  cloudinaryConfigOption: cloudinaryConfigOption,
});

export const uploadHomeVideoZodSchema = z.object({
  title: validateZodString({ field: "title", blockMultipleSpaces: true }),
  cloudinaryConfigOption: cloudinaryConfigOption,
});

export const uploadImageZodSchema = z.object({
  folderName: validateZodString({
    field: "folderName",
    blockSingleSpace: true,
  }),
  cloudinaryConfigOption: cloudinaryConfigOption,
});
