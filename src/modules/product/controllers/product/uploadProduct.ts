import { Response } from "express";

import { AuthorizedRequest } from "../../../../types";
import { addShadeJoiSchema, uploadProductJoiSchema } from "../../validations";
import { Shared } from "../../../..";
import { findOrCreateCategory } from "../../services";
import { getCloudinaryOptimizedUrl } from "../../../../utils";
import { Product, Shade } from "../../models";
import { MediaModule } from "../../..";

export const uploadProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const files = req.files as Express.Multer.File[];
  const body = req.body;
  const user = req.user;

  const {
    title,
    brand,
    originalPrice,
    sellingPrice,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    categoryLevelOne,
    categoryLevelTwo,
    categoryLevelThree,
    totalStock,
    shadesData,
  } = {
    title: req.body.title?.trim(),
    brand: req.body.brand?.trim(),
    originalPrice: Number(body.originalPrice.trim()),
    sellingPrice: Number(body.sellingPrice.trim()),
    description: req.body.description?.trim(),
    howToUse: req.body.howToUse?.trim(),
    ingredients: req.body.ingredients?.trim(),
    additionalDetails: req.body.additionalDetails?.trim(),
    categoryLevelOne: req.body.categoryLevelOne?.trim(),
    categoryLevelTwo: req.body.categoryLevelTwo?.trim(),
    categoryLevelThree: req.body.categoryLevelThree?.trim(),
    totalStock: Number(body.totalStock.trim()),
    shadesData:
      typeof req.body.shades === "string"
        ? JSON.parse(req.body.shades)
        : req.body.shades,
  };

  const { error } = uploadProductJoiSchema.validate({
    title,
    brand,
    originalPrice,
    sellingPrice,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    categoryLevelOne,
    categoryLevelTwo,
    categoryLevelThree,
    totalStock,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    throw new Shared.Classes.AppError(errorMessage, 400);
  }

  let category = null;

  if (categoryLevelOne && categoryLevelTwo && categoryLevelThree) {
    // Find or Create Level-One Category
    const category_1 = await findOrCreateCategory(categoryLevelOne, 1, null);

    // Find or Create Level-Two Category (Parent must be Level-One)
    const category_2 = await findOrCreateCategory(
      categoryLevelTwo,
      2,
      category_1._id.toString()
    );

    // Find or Create Level-Three Category (Parent must be Level-Two)
    const category_3 = await findOrCreateCategory(
      categoryLevelThree,
      3,
      category_2._id.toString()
    );
    category = category_3._id;
  } else {
    throw new Shared.Classes.AppError("All categories are required", 400);
  }
  const shades = Array.isArray(shadesData) ? shadesData : [shadesData];
  const commonImages: Express.Multer.File[] = [];
  const shadeImagesMap: Record<number, Express.Multer.File[]> = {};

  files?.forEach((file) => {
    if (file.fieldname.startsWith("commonImages")) {
      commonImages.push(file);
    }

    const shadeMatch = file?.fieldname.match(/^shades\[(\d+)\]\[images\]/);
    if (shadeMatch) {
      const shadeIndex = parseInt(shadeMatch[1]);
      if (!shadeImagesMap[shadeIndex]) {
        shadeImagesMap[shadeIndex] = [];
      }
      shadeImagesMap[shadeIndex].push(file);
    }
  });

  // Upload common images
  const uploadedCommonImages = await MediaModule.Utils.multipleImagesUploader({
    files: commonImages,
    folder: `Products/${title}/Common_Images`,
    cloudinaryConfigOption: "product",
  });

  // Upload shade images
  const enrichedShades = await Promise.all(
    shades?.map(async (shade, idx) => {
      const shadeFiles = shadeImagesMap[idx] || [];
      const uploadedShadeImages =
        await MediaModule.Utils.multipleImagesUploader({
          files: shadeFiles,
          folder: `Products/${title}/Shades/${shade.shadeName}`,
          cloudinaryConfigOption: "product",
        });

      const images = uploadedShadeImages?.map((img) =>
        getCloudinaryOptimizedUrl(img.secure_url)
      );

      return {
        ...shade,
        stock: Number(shade.stock),
        images,
      };
    })
  );

  if (enrichedShades?.length > 0) {
    const { error } = addShadeJoiSchema.validate(enrichedShades);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new Shared.Classes.AppError(errorMessage, 400);
    }
  }

  const newShadeIds = await Promise.all(
    enrichedShades?.map(async (shade) => {
      const newShade = await Shade.create(shade);
      return newShade._id;
    })
  );

  const finalData = {
    title,
    brand,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    category,
    discount: Math.round(
      ((originalPrice - sellingPrice) / originalPrice) * 100
    ),
    seller: user?._id,
    originalPrice,
    sellingPrice,
    commonImages: uploadedCommonImages.map((img) =>
      getCloudinaryOptimizedUrl(img.secure_url)
    ),
    shades: newShadeIds,
    totalStock,
  };

  try {
    const product = await Product.create(finalData);

    res.success(200, "Product uploaded successfully", product);
  } catch (error) {
    // Rollback: Remove uploaded common images
    await MediaModule.Utils.multipleImagesRemover(
      uploadedCommonImages.map((img) => img.secure_url),
      "product"
    );

    // Rollback: Remove uploaded shades
    await Shade.deleteMany({
      _id: { $in: newShadeIds },
    });

    // Rollback: Remove uploaded shade images
    await Promise.all(
      enrichedShades?.map((shade) =>
        MediaModule.Utils.multipleImagesRemover(shade?.images, "product")
      )
    );

    throw error;
  }
};
