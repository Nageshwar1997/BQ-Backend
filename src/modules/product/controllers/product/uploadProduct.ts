import { Response } from "express";
import { Types } from "mongoose";
import { UploadApiResponse } from "cloudinary";

import { AuthorizedRequest } from "../../../../types";
import { ShadeProps } from "../../types";
import { AppError } from "../../../../classes";
import { getCloudinaryOptimizedUrl } from "../../../../utils";
import { Product, Shade } from "../../models";
import { MediaModule } from "../../..";

export const uploadProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const files = req.files as Express.Multer.File[];
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
    category,
    commonImages,
    totalStock,
    shades,
  } = {
    title: req.body.title?.trim(),
    brand: req.body.brand?.trim(),
    originalPrice: req.body.originalPrice,
    sellingPrice: req.body.sellingPrice,
    description: req.body.description?.trim(),
    howToUse: req.body.howToUse?.trim(),
    ingredients: req.body.ingredients?.trim(),
    additionalDetails: req.body.additionalDetails?.trim(),
    category: req.body.category,
    totalStock: req.body.totalStock,
    commonImages: req.body.commonImages,
    shades: req.body.shades,
  };

  const finalData = {
    title,
    brand,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    category,
    discount: ((originalPrice - sellingPrice) / originalPrice) * 100,
    seller: user?._id,
    originalPrice,
    sellingPrice,
    commonImages,
    shades,
    totalStock,
  };
  try {
    const product = await Product.create(finalData);

    res.success(200, "Product uploaded successfully", { product });
  } catch (error) {
    // Rollback: Remove uploaded common images
    if (commonImages.length > 0) {
      await MediaModule.Utils.multipleImagesRemover(commonImages, "product");
    }

    // Rollback: Remove uploaded shades
    if (shades.length) {
      const removingShades = await Shade.find({ _id: { $in: shades } });

      await Promise.all(
        removingShades.map((shade: ShadeProps) =>
          MediaModule.Utils.multipleImagesRemover(shade.images, "product")
        )
      ); // To remove all shade images
      await Shade.deleteMany({ _id: { $in: shades } }); // To remove all shades
    }

    throw error;
  }
};
