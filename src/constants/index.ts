import { CommonConstants } from "./Common.Constant";
import { FileConstants } from "./File.Constant";
import { Regex } from "./Regex.Constant.ts";
import { ZodConstants } from "./Zod.Constant.ts";

export * from "./Zod.Constant.ts";

export const Constants = {
  Common: CommonConstants,
  File: FileConstants,
  Regex,
  Zod: ZodConstants,
};
