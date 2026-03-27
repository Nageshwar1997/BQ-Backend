import { MulterError } from "multer";
import { IS_DEV_MODE } from "../../../envs";

type TFieldErrors = Record<string, string[]>;

export const getMulterError = ({
  err,
  fieldName = "",
  maxCount,
}: {
  err: MulterError | Error;
  fieldName?: string;
  maxCount?: number;
}) => {
  const fieldErrors: TFieldErrors = {};
  const globalErrors: string[] = [];

  const pushFieldError = (field: string, message: string) => {
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(message);
  };

  const pushGlobalError = (message: string) => {
    globalErrors.push(message);
  };

  const getCause = (err: MulterError | Error) => {
    return err?.cause && IS_DEV_MODE ? ` (cause: ${String(err.cause)})` : "";
  };

  if (err instanceof MulterError) {
    const field = err.field || fieldName || "";

    switch (err.code) {
      case "LIMIT_UNEXPECTED_FILE": {
        const base = err.field
          ? `Unexpected file '${err.field}'.`
          : `Unexpected file upload.`;

        const msg =
          fieldName && maxCount
            ? `${base} Expected '${fieldName}', max ${maxCount} file${
                maxCount > 1 ? "s" : ""
              }.`
            : base;

        pushFieldError(field, msg + getCause(err));
        break;
      }

      case "LIMIT_FILE_COUNT": {
        pushFieldError(
          field,
          `Too many files uploaded. Allowed: ${maxCount ?? "limited"}${getCause(err)}`,
        );
        break;
      }

      case "LIMIT_FILE_SIZE": {
        pushFieldError(
          field,
          `File size exceeded for '${field}'.${getCause(err)}`,
        );
        break;
      }

      case "LIMIT_FIELD_COUNT": {
        pushGlobalError(`Too many fields in request.${getCause(err)}`);
        break;
      }

      case "LIMIT_FIELD_KEY": {
        pushGlobalError(`Invalid field key.${getCause(err)}`);
        break;
      }

      case "LIMIT_FIELD_VALUE": {
        pushGlobalError(`Field value too large.${getCause(err)}`);
        break;
      }

      case "LIMIT_PART_COUNT":
      case "MISSING_FIELD_NAME": {
        pushGlobalError(`Malformed multipart request.${getCause(err)}`);
        break;
      }

      default: {
        pushGlobalError(
          `Upload error (${err.code}) on field '${field}'.${getCause(err)}`,
        );
      }
    }
  } else if (err) {
    pushGlobalError(`Upload failed: ${err.message}${getCause(err)}`);
  }

  return {
    fieldErrors,
    globalErrors,
  };
};
