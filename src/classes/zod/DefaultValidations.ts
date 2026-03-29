import { string, ZodString } from "zod";
import { zodConstants } from "./ZodConstants";
import { IZodStringConfigs } from "../../utils/zod.utils";

export class BaseZodString {
  protected schema: ZodString;
  protected name: string = "";

  constructor() {
    this.schema = string().trim();
  }

  private required() {
    this.schema = this.schema.nonempty({
      message: `${this.name} is required.`,
    });
  }

  private min(length: number) {
    this.schema = this.schema.min(
      length,
      `${this.name} must be at least ${length} characters.`,
    );
  }

  private max(length: number) {
    this.schema = this.schema.max(
      length,
      `${this.name} must not exceed ${length} characters.`,
    );
  }

  private noSpaces() {
    this.schema = this.schema.regex(
      zodConstants.regexes.noSpace,
      `${this.name} must not contain spaces.`,
    );
  }

  private allowSingleSpace() {
    this.schema = this.schema.regex(
      zodConstants.regexes.singleSpace,
      `${this.name} must not contain multiple spaces.`,
    );
  }

  private regex(regex: RegExp, message: string) {
    this.schema = this.schema.regex(regex, `${this.name} ${message}.`);
  }

  private multiRegex(regexes: { regex: RegExp; message: string }[]) {
    regexes.forEach(({ regex, message }) => {
      this.schema = this.schema.regex(regex, `${this.name} ${message}.`);
    });
  }

  private toggleCase(caseType: "lower" | "upper") {
    if (caseType === "lower") {
      this.schema = this.schema.toLowerCase();
    } else if (caseType === "upper") {
      this.schema = this.schema.toUpperCase();
    }
  }

  public validate(props: IZodStringConfigs): ZodString {
    const {
      field,
      label,
      allowSpace = true,
      customRegexes,
      customRegex,
      lowerOrUpper,
      max,
      min,
      nonEmpty = true,
      parentField,
      parentLabel,
    } = props;

    const baseName = label ?? field;
    const parentName = parentLabel ?? parentField;
    this.name = parentName ? `${parentName}: ${baseName}` : baseName;

    this.schema = string().trim();

    if (nonEmpty) {
      this.required();
      if (min != undefined) this.min(min);
      if (max != undefined) this.max(max);
    }

    allowSpace ? this.allowSingleSpace() : this.noSpaces();

    if (customRegexes?.length) {
      this.multiRegex(customRegexes);
    }

    if (customRegex) {
      this.regex(customRegex.regex, customRegex.message);
    }
    if (lowerOrUpper) {
      this.toggleCase(lowerOrUpper);
    }

    return this.schema;
  }
}

