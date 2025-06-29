import { Response } from "express";
import { AuthorizedRequest } from "../../../../types";
import { Product, Shade } from "../../models";
import { checkUserPermission, isValidMongoId } from "../../../../utils";
import { AppError } from "../../../../classes";
import { MediaModule } from "../../..";
import { Types } from "mongoose";

const extractImageUrls = (html: string): string[] => {
  const regex = /<img[^>]+src="([^">]+)"/g;
  const urls: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    urls.push(match[1]);
  }

  return urls;
};

export const deleteProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { productId } = req.params;
  const userId = req.user?._id;

  isValidMongoId(productId, "Invalid Product Id", 400);

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (req.user?.role !== "MASTER") {
    checkUserPermission({
      checkId: product.seller,
      userId: userId as Types.ObjectId,
      message: "You are not authorized to delete this product",
      statusCode: 403,
    });
  }

  await product.deleteOne();

  const removingImages: string[] = [
    ...product.commonImages,
    ...extractImageUrls(
      `${product.description} ${product.howToUse} ${product.ingredients} ${product.additionalDetails}`
    ),
  ];

  const shades = await Shade.find({ _id: { $in: product.shades } }).lean();

  if (shades?.length) {
    shades.forEach((shade) => {
      removingImages.push(...shade.images);
    });
  }

  await Shade.deleteMany({ _id: { $in: product.shades } });

  await MediaModule.Utils.multipleImagesRemover(removingImages, "product");

  res.success(200, "Product deleted successfully");
};
