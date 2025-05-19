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
    shadesTotalStock,
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
    shadesTotalStock: req.body?.shadesTotalStock,
    shades: req.body.shades,
  };

  const commonImages: Express.Multer.File[] = files?.filter((file) =>
    file.fieldname.startsWith("commonImages")
  );

  let uploadedCommonImages: UploadApiResponse[] | [] = [];
  let newShadeIds: (string | Types.ObjectId)[] = [];
  let finalStock = 0;

  // Upload common images
  uploadedCommonImages = await MediaModule.Utils.multipleImagesUploader({
    files: commonImages,
    folder: `Products/${title}/Common_Images`,
    cloudinaryConfigOption: "product",
  });

  // Upload shades
  if (shades?.length > 0) {
    newShadeIds = await Promise.all(
      shades.map(async (shade: ShadeProps) => {
        const newShade = await Shade.create(shade);
        return newShade._id;
      })
    );

    if (shadesTotalStock === totalStock) {
      finalStock = totalStock;
    } else {
      throw new AppError(
        "Shades total stock and total stock should be same",
        400
      );
    }
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
    commonImages: uploadedCommonImages.map((img) =>
      getCloudinaryOptimizedUrl(img.secure_url)
    ),
    shades: newShadeIds,
    totalStock: finalStock,
  };
  try {
    const product = await Product.create(finalData);

    res.success(200, "Product uploaded successfully", { product });
  } catch (error) {
    // Rollback: Remove uploaded common images
    if (uploadedCommonImages.length > 0) {
      await MediaModule.Utils.multipleImagesRemover(
        uploadedCommonImages.map((img) => img.secure_url),
        "product"
      );
    }

    // Rollback: Remove uploaded shades
    if (newShadeIds.length > 0) {
      await Shade.deleteMany({ _id: { $in: newShadeIds } });
    }

    if (shades.length > 0) {
      await Promise.all(
        shades.map((shade: ShadeProps) =>
          MediaModule.Utils.multipleImagesRemover(shade.images, "product")
        )
      );
    }

    throw error;
  }
};
