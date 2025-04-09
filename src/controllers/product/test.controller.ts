import { NextFunction, Request, Response } from "express";
import { imageUploader } from "../../utils/mediaUploader";
import { AppError } from "../../constructors";
import { Category, Product, ProductShade } from "../../models";
import { CatchErrorResponse, SuccessResponse } from "../../utils";
import { AuthenticatedRequest } from "../../types";

const findOrCreateCategory = async (
  name: string,
  level: number,
  parentCategory: string | null
) => {
  let category = await Category.findOne({ name, parentCategory });

  if (!category) {
    category = await Category.create({ name, parentCategory, level });
  }

  return category;
};

export const uploadProductController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const body = req.body;

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
    } = body;

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
      throw new AppError("All categories are required", 400);
    }

    const shadesData = JSON.parse(JSON.stringify(body.shades || []));
    const shades = Array.isArray(shadesData) ? shadesData : [shadesData];

    const commonImages: Express.Multer.File[] = [];
    const shadeImagesMap: Record<number, Express.Multer.File[]> = {};

    files.forEach((file) => {
      if (file.fieldname.startsWith("commonImages")) {
        commonImages.push(file);
      }

      const shadeMatch = file.fieldname.match(/^shades\[(\d+)\]\[images\]/);
      if (shadeMatch) {
        const shadeIndex = parseInt(shadeMatch[1]);
        if (!shadeImagesMap[shadeIndex]) {
          shadeImagesMap[shadeIndex] = [];
        }
        shadeImagesMap[shadeIndex].push(file);
      }
    });

    // ✅ Upload common images
    const uploadedCommonImages = await Promise.all(
      commonImages.map((file) =>
        imageUploader({ file, folder: `Products/${title}/Common_Images` })
      )
    );

    // ✅ Upload shade images
    const enrichedShades = await Promise.all(
      shades?.map(async (shade, idx) => {
        const shadeFiles = shadeImagesMap[idx] || [];
        const uploadedShadeImages = await Promise.all(
          shadeFiles.map((file) =>
            imageUploader({
              file,
              folder: `Products/${title}/Shades/${shade.shadeName}`,
            })
          )
        );

        return {
          ...shade,
          stock: parseInt(shade.stock),
          images: uploadedShadeImages.map((img) => img.secure_url),
        };
      })
    );

    console.log("enrichedShades", enrichedShades);

    const shadesTest = await Promise.all(
      enrichedShades.map(async (shade) => {
        const newShade = await ProductShade.create(shade);

        return newShade;
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
      seller: req.user?._id,
      originalPrice: parseFloat(originalPrice),
      sellingPrice: parseFloat(sellingPrice),
      commonImages: uploadedCommonImages.map((img) => img.secure_url),
      shades: shadesTest,
    };

    const product = await Product.create(finalData);

    SuccessResponse(res, 200, "Product uploaded", { product });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};
