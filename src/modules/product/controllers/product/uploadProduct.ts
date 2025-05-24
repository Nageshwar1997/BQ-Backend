import { Response } from "express";

import { AuthorizedRequest } from "../../../../types";
import { ShadeProps } from "../../types";
import { AppError } from "../../../../classes";
import { Product, Shade } from "../../models";
import { MediaModule } from "../../..";

export const uploadProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
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
  } = req.body;

  if (sellingPrice > originalPrice) {
    throw new AppError(
      "Selling price cannot be higher than original price",
      400
    );
  }

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
