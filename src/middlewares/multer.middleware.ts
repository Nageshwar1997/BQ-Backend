import multer, { MulterError } from "multer";
import { NextFunction, Request, RequestHandler, Response } from "express";

import {
  IMulterCustomError,
  IMulterDefaultError,
  IMulterValidation,
} from "../types";
import { classes } from "../classes";
import { IS_DEV_MODE } from "../envs";
import { constants } from "../constants";

const getCustomError = ({ files = [], format, size }: IMulterCustomError) => {
  const error = new classes.ErrorBuilder();

  // Limits
  const imageSizeLimit = size?.IMAGE ?? constants.file.size.IMAGE;
  const videoSizeLimit = size?.VIDEO ?? constants.file.size.VIDEO;
  const otherSizeLimit = size?.OTHER ?? constants.file.size.OTHER;

  // Types
  const allowedImageTypes = format?.IMAGE ?? constants.file.formats.IMAGE;
  const allowedVideoTypes = format?.VIDEO ?? constants.file.formats.VIDEO;
  const allowedOtherTypes = format?.OTHER ?? [];

  for (const file of files) {
    const { originalname, fieldname, size, mimetype } = file;

    const isImage = allowedImageTypes.includes(mimetype);
    const isVideo = allowedVideoTypes.includes(mimetype);
    const isOther = allowedOtherTypes.includes(mimetype);

    const fileSizeMB = (size / constants.file.size.MB).toFixed(2);

    let allowedSizeMB = "0";

    if (isImage)
      allowedSizeMB = (imageSizeLimit / constants.file.size.MB).toFixed(2);
    else if (isVideo)
      allowedSizeMB = (videoSizeLimit / constants.file.size.MB).toFixed(2);
    else if (isOther)
      allowedSizeMB = (otherSizeLimit / constants.file.size.MB).toFixed(2);

    // SIZE VALIDATION
    if (isImage && size > imageSizeLimit) {
      error.addField(
        fieldname,
        `Image '${originalname}' too large (${fileSizeMB}MB). Max: ${allowedSizeMB}MB.`,
      );
      continue;
    }

    if (isVideo && size > videoSizeLimit) {
      error.addField(
        fieldname,
        `Video '${originalname}' too large (${fileSizeMB}MB).`,
      );
      continue;
    }

    if (isOther && size > otherSizeLimit) {
      error.addField(fieldname, `File '${originalname}' too large.`);
      continue;
    }

    // TYPE VALIDATION
    if (!isImage && !isVideo && !isOther) {
      const allowedTypes = [
        ...allowedImageTypes,
        ...allowedVideoTypes,
        ...allowedOtherTypes,
      ]
        .map((t) => t.split("/")[1])
        .join(", ");

      error.addField(
        fieldname,
        `File '${originalname}' has invalid type '${mimetype}'. Allowed: [${allowedTypes}]`,
      );
    }
  }

  return error.build();
};

const getMulterDefaultError = ({
  err,
  fieldName = "",
  maxCount,
}: IMulterDefaultError) => {
  const error = new classes.ErrorBuilder();

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

export const multerMiddleware = ({
  type,
  fieldName,
  maxCount,
  fieldsConfig,
  limits,
  format,
  size,
}: IMulterValidation) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage, limits });

  let uploadMiddleware: RequestHandler;

  switch (type) {
    case "single":
      if (!fieldName)
        throw new Error("Field name is required for single upload.");
      uploadMiddleware = upload.single(fieldName);
      break;

    case "array":
      if (!fieldName)
        throw new Error("Field name is required for array upload.");
      uploadMiddleware = upload.array(fieldName, maxCount);
      break;

    case "fields":
      if (!fieldsConfig) throw new Error("fieldsConfig is required.");
      uploadMiddleware = upload.fields(fieldsConfig);
      break;

    case "any":
      uploadMiddleware = upload.any();
      break;

    case "none":
      uploadMiddleware = upload.none();
      break;

    default:
      throw new Error("Invalid upload type");
  }

  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err) => {
      const error = new classes.ErrorBuilder();

      // Multer errors
      error.merge(getMulterDefaultError({ err, fieldName, maxCount }));

      if (error.hasErrors()) {
        return next(
          error.throw({
            message: err?.message || "File validation failed",
            statusCode: 400,
            code: "UPLOAD_ERROR",
          }),
        );
      }

      // File validation
      const checkableTypes: IMulterValidation["type"][] = [
        "single",
        "array",
        "any",
        "fields",
      ];

      if (checkableTypes.includes(type)) {
        let files: Express.Multer.File[] = [];

        switch (type) {
          case "fields": {
            files = Object.values(
              req.files || {},
            ).flat() as Express.Multer.File[];
            break;
          }

          case "array":
          case "any": {
            files = (req.files as Express.Multer.File[]) || [];
            break;
          }

          case "single": {
            if (req.file) files = [req.file];
            break;
          }
        }

        error.merge(getCustomError({ files, size, format }));

        if (error.hasErrors()) {
          return next(
            error.throw({
              message: "File validation failed",
              statusCode: 400,
              code: "UPLOAD_ERROR",
            }),
          );
        }
      }

      next();
    });
  };
};
