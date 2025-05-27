import { Types } from "mongoose";
import { NextFunction, Response } from "express";
import { AuthorizedRequest } from "../../../../types";
import { MediaModule } from "../../..";
import { AppError } from "../../../../classes";
import { Shade } from "../../models";

export const addShadesToRequest = async (
  req: AuthorizedRequest,
  _: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];
  const { shades, title } = req.body;

  const commonImageFiles: Express.Multer.File[] = [];
  let uploadedCommonImages: string[] = [];
  let uploadedAllShadesImages: string[] = [];

  const shadeImagesMap: Record<number, Express.Multer.File[]> = {};
  files?.forEach((file) => {
    if (file.fieldname.startsWith("commonImages")) {
      commonImageFiles.push(file);
    } else {
      const shadeMatch = file?.fieldname.match(/^shades\[(\d+)\]\[images\]/);

      if (shadeMatch) {
        const shadeIndex = parseInt(shadeMatch[1]);
        if (!shadeImagesMap[shadeIndex]) {
          shadeImagesMap[shadeIndex] = [];
        }
        shadeImagesMap[shadeIndex].push(file);
      }
    }
  });

  if (!commonImageFiles.length) {
    throw new AppError("Common images are required", 400);
  }

  try {
    // Upload common images
    const uploadedCommonImagesResult =
      await MediaModule.Utils.multipleImagesUploader({
        files: commonImageFiles,
        folder: `Products/${title}/Common_Images`,
        cloudinaryConfigOption: "product",
      });

    uploadedCommonImages = uploadedCommonImagesResult.map(
      (img) => img.secure_url
    );
    req.body.commonImages = uploadedCommonImages;

    if (shades) {
      const shadesData = Array.isArray(shades) ? shades : [shades];
      let newShadeIds: (string | Types.ObjectId)[] = [];

      const missingShadeErrors: string[] = [];
      let totalStock = 0;

      shadesData.forEach((shade, idx) => {
        if (!(shadeImagesMap[idx] && shadeImagesMap[idx].length > 0)) {
          const shadeName = shade.shadeName || `Unknown Shade at index ${idx}`;
          missingShadeErrors.push(
            `Shade: '${shadeName}' At least 1 image is required`
          );
        }
      });

      if (missingShadeErrors.length > 0) {
        const errorMessage = missingShadeErrors
          .map(
            (msg, i) =>
              `${missingShadeErrors.length > 1 ? `${i + 1}). ` : ""}${msg}${
                i === missingShadeErrors.length - 1 ? "." : ""
              }`
          )
          .join(", ");
        throw new AppError(errorMessage, 400);
      }

      // Upload shade images
      const enrichedShades = await Promise.all(
        shadesData.map(async (shade, idx) => {
          const shadeFiles = shadeImagesMap[idx] || [];

          totalStock += shade.stock;
          const uploadedShadeImagesResult =
            await MediaModule.Utils.multipleImagesUploader({
              files: shadeFiles,
              folder: `Products/${title}/Shades/${shade.shadeName}`,
              cloudinaryConfigOption: "product",
            });

          const images = uploadedShadeImagesResult.map((img) => img.secure_url);
          uploadedAllShadesImages.push(...images);

          return {
            ...shade,
            stock: shade.stock,
            images,
          };
        })
      );

      newShadeIds = await Promise.all(
        enrichedShades.map(async (shade) => {
          const newShade = await Shade.create(shade);
          return newShade._id;
        })
      );

      req.body.shades = newShadeIds.length > 0 ? newShadeIds : [];
      req.body.totalStock = totalStock ? totalStock : req.body.totalStock;
    }

    next();
  } catch (error) {
    if (uploadedCommonImages.length) {
      await MediaModule.Utils.multipleImagesRemover(
        uploadedCommonImages,
        "product"
      );
    }
    // Remove uploaded images
    if (uploadedAllShadesImages.length > 0) {
      await MediaModule.Utils.multipleImagesRemover(
        uploadedAllShadesImages,
        "product"
      );
    }
    next(error);
  }
};
