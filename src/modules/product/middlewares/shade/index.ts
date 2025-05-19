import { NextFunction, Response } from "express";
import { AuthorizedRequest } from "../../../../types";
import { MediaModule } from "../../..";
import { getCloudinaryOptimizedUrl } from "../../../../utils";
import { AppError } from "../../../../classes";

export const addShadesToRequest = async (
  req: AuthorizedRequest,
  _: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];
  const { shades, title } = req.body;

  if (shades) {
    try {
      const shadesData = Array.isArray(shades) ? shades : [shades];

      const shadeImagesMap: Record<number, Express.Multer.File[]> = {};
      files?.forEach((file) => {
        const shadeMatch = file?.fieldname.match(/^shades\[(\d+)\]\[images\]/);

        if (shadeMatch) {
          const shadeIndex = parseInt(shadeMatch[1]);
          if (!shadeImagesMap[shadeIndex]) {
            shadeImagesMap[shadeIndex] = [];
          }
          shadeImagesMap[shadeIndex].push(file);
        }
      });

      const missingShadeErrors: string[] = [];

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

      const shadesTotalStock = shadesData.reduce(
        (total, shade) => total + shade.stock,
        0
      );

      // Upload shade images
      const enrichedShades = await Promise.all(
        shadesData.map(async (shade, idx) => {
          const shadeFiles = shadeImagesMap[idx] || [];

          const uploadedShadeImages =
            await MediaModule.Utils.multipleImagesUploader({
              files: shadeFiles,
              folder: `Products/${title}/Shades/${shade.shadeName}`,
              cloudinaryConfigOption: "product",
            });

          const images = uploadedShadeImages.map((img) =>
            getCloudinaryOptimizedUrl(img.secure_url)
          );

          return {
            ...shade,
            stock: shade.stock,
            images,
          };
        })
      );

      req.body.shades = enrichedShades ?? [];

      req.body.shadesTotalStock = shadesTotalStock ?? 0;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
};
