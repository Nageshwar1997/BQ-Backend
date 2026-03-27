// utils/ErrorBuilder.ts

import { AppError } from "./AppError";
import { TErrorPayload } from "../types";

export class ErrorBuilder {
  private fieldErrors: TErrorPayload["fieldErrors"] = {};
  private globalErrors: TErrorPayload["globalErrors"] = [];

  // Add field error
  public addField(field: string, message: string) {
    if (!this.fieldErrors[field]) {
      this.fieldErrors[field] = [];
    }
    this.fieldErrors[field].push(message);
    return this;
  }

  // Add multiple field errors
  public addFields(field: string, messages: string[]) {
    messages.forEach((msg) => this.addField(field, msg));
    return this;
  }

  // Add global error
  public addGlobal(message: string) {
    this.globalErrors.push(message);
    return this;
  }

  // Merge existing errors
  public merge(errors: TErrorPayload) {
    if (errors.fieldErrors) {
      Object.entries(errors.fieldErrors).forEach(([field, msgs]) => {
        this.addFields(field, msgs);
      });
    }

    if (errors.globalErrors) {
      errors.globalErrors.forEach((msg) => this.addGlobal(msg));
    }

    return this;
  }

  // Check if any error exists
  public hasErrors() {
    return (
      Object.keys(this.fieldErrors).length > 0 || this.globalErrors.length > 0
    );
  }

  // Build final object
  public build(): TErrorPayload {
    return {
      fieldErrors: this.fieldErrors,
      globalErrors: this.globalErrors,
    };
  }

  // Throw directly
  public throw(options: ConstructorParameters<typeof AppError>[0]) {
    if (this.hasErrors()) {
      throw new AppError({ ...options, ...this.build() });
    }
  }
}

