import { Response } from "express";
import { Types } from "mongoose";

import { AuthorizedRequest } from "../../../../types";
import { AppError } from "../../../../classes";
import { Product, Shade } from "../../models";
import { findOrCreateCategory } from "../../services";
import { removeImages, uploadImages } from "../../utils";

export const uploadProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const user = req.user;

  const {
    title,
    brand,
    shades,
    howToUse,
    totalStock,
    ingredients,
    description,
    sellingPrice,
    originalPrice,
    categoryLevelOne,
    categoryLevelTwo,
    additionalDetails,
    categoryLevelThree,
  } = req.body;

  const files = req.files as Express.Multer.File[];

  // Find or Create Level-Two Category (Parent must be null)
  const category_1 = await findOrCreateCategory(
    categoryLevelOne.name,
    categoryLevelOne.category,
    null,
    1
  );

  // Find or Create Level-Two Category (Parent must be Level-One)
  const category_2 = await findOrCreateCategory(
    categoryLevelTwo.name,
    categoryLevelTwo.category,
    category_1._id,
    2
  );

  // Find or Create Level-Three Category (Parent must be Level-Two)
  const category_3 = await findOrCreateCategory(
    categoryLevelThree.name,
    categoryLevelThree.category,
    category_2._id,
    3
  );

  if (sellingPrice > originalPrice) {
    throw new AppError(
      "Selling price cannot be higher than original price",
      400
    );
  }

  const commonImageFiles: Express.Multer.File[] = [];
  let uploadedCommonImages: string[] = [];
  let uploadedAllShadesImages: string[] = [];
  let newShadeIds: Types.ObjectId[] = [];

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

  // Upload common images
  uploadedCommonImages = await uploadImages(
    commonImageFiles,
    `Products/${title}/Common_Images`
  );

  try {
    if (shades?.length) {
      const shadesData = Array.isArray(shades) ? shades : [shades];

      const missingShadeErrors: string[] = [];
      let shadesTotalStock = 0;

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

          shadesTotalStock += shade.stock;

          const images = await uploadImages(
            shadeFiles,
            `Products/${title}/Shades/${shade.shadeName}`
          );

          uploadedAllShadesImages.push(...images);

          return { ...shade, images };
        })
      );

      if (shadesTotalStock !== totalStock) {
        throw new AppError(
          "Shades total stock does not match total stock",
          400
        );
      }

      const insertedShades = await Shade.insertMany(enrichedShades);

      console.log("insertedShades", insertedShades);
      newShadeIds = insertedShades.map((shade) => shade._id);

      console.log("newShadeIds", newShadeIds);
    }
  } catch (error) {
    removeImages([...uploadedCommonImages, ...uploadedAllShadesImages]);
    throw error;
  }

  const finalData = {
    title,
    brand,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    category: category_3._id,
    discount: ((originalPrice - sellingPrice) / originalPrice) * 100,
    seller: user?._id,
    originalPrice,
    sellingPrice,
    commonImages: uploadedCommonImages,
    shades: newShadeIds.length > 0 ? newShadeIds : [],
    totalStock,
  };
  try {
    const product = await Product.create(finalData);

    res.success(200, "Product uploaded successfully", { product });
  } catch (error) {
    // Rollback: Remove uploaded images
    removeImages([...uploadedCommonImages, ...uploadedAllShadesImages]);
    // Rollback: Remove uploaded shades
    if (newShadeIds.length) {
      await Shade.deleteMany({ _id: { $in: newShadeIds } }); // To remove all shades
    }

    throw error;
  }
};
