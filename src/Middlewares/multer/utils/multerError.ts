import { MulterError } from "multer";
import { IS_DEV_MODE } from "../../../envs";
import { ErrorBuilder } from "../../../classes";

export const getMulterError = ({
  err,
  fieldName = "",
  maxCount,
}: {
  err?: MulterError | Error;
  fieldName?: string;
  maxCount?: number;
}) => {
  const error = new ErrorBuilder();

  if (!err) return error.build();

  const getCause = (cause?: unknown) => {
    return cause && IS_DEV_MODE ? ` (cause: ${String(cause)})` : "";
  };

  if (err instanceof MulterError) {
    const field = err.field || fieldName || "";

    switch (err.code) {
      case "LIMIT_UNEXPECTED_FILE": {
        const base = err.field
          ? `Unexpected file '${field}'.`
          : `Unexpected file upload.`;

        const msg =
          fieldName && maxCount
            ? `${base} Expected '${fieldName}', max ${maxCount} file${
                maxCount > 1 ? "s" : ""
              }.`
            : base;
        error.addField(field, `${msg}${getCause(err.cause)}`);
        break;
      }

      case "LIMIT_FILE_COUNT": {
        error.addField(
          field,
          `Too many files uploaded. Allowed: ${maxCount ?? "limited"}${getCause(err.cause)}`,
        );
        break;
      }

      case "LIMIT_FILE_SIZE": {
        error.addField(
          field,
          `File too large '${field}'.` + getCause(err.cause),
        );
        break;
      }

      case "LIMIT_FIELD_COUNT": {
        error.addField(
          field,
          `Too many fields in request.${getCause(err.cause)}`,
        );
        break;
      }

      case "LIMIT_FIELD_KEY": {
        error.addField(field, `Invalid field key.${getCause(err)}`);
        break;
      }

      case "LIMIT_FIELD_VALUE": {
        error.addField(field, `Field value too large.${getCause(err)}`);
        break;
      }

      case "LIMIT_PART_COUNT":
      case "MISSING_FIELD_NAME": {
        error.addField(field, `Malformed multipart request.${getCause(err)}`);
        break;
      }

      default:
        error.addField(
          field,
          `Upload error (${err.code}).` + getCause(err.cause),
        );
    }
  } else {
    error.addGlobal(`Upload failed: ${err.message}${getCause(err.cause)}`);
  }

  return error.build();
};
