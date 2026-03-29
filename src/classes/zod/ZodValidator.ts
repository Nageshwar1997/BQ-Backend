import { IZodStringConfigs } from "../../utils/zod.utils";
import { BaseZodString } from "./DefaultValidations";

export class ZodValidator {
  public string(config: IZodStringConfigs) {
    return new BaseZodString().validate(config);
  }
}

export const validator = new ZodValidator();
