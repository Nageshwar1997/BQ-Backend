import { Types } from "mongoose";
import { Response } from "express";
import { AuthorizedRequest } from "../../../../types";
import { Product, Shade } from "../../models";
import { AppError } from "../../../../classes";
import { MediaModule } from "../../..";
import { PopulatedProduct, ProductProps, ShadeProps } from "../../types";
import { findOrCreateCategory } from "../../services";
import { checkUserPermission, isValidMongoId } from "../../../../utils";
import { possibleUpdateProductFields } from "../../constants";

export const updateProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { productId } = req.params;
  isValidMongoId(productId, "Invalid Product Id", 400);

  checkUserPermission({
    userId: req.user?._id as string,
    checkId: productId as string,
    message: "You are not authorized to update this product",
    statusCode: 403,
  });

  const {
    title,
    brand,
    originalPrice,
    sellingPrice,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    totalStock,
    removingShadeImageUrls,
    categoryLevelOne,
    categoryLevelTwo,
    categoryLevelThree,
    newAddedShades,
    removingCommonImageURLs,
    removingShades,
    updatedShadeWithFiles,
    updatedShadeWithoutFiles,
  } = req.body;

  const productBodyData: Partial<ProductProps> = {
    title,
    brand,
    originalPrice,
    sellingPrice,
    description,
    howToUse,
    ingredients,
    additionalDetails,
    totalStock,
  };

  const updateBody: Partial<ProductProps> = {};

  for (const field of possibleUpdateProductFields) {
    const value = productBodyData[field];

    if (value !== undefined && value !== null) {
      (updateBody[field] as unknown) = value;
    }
  }

  const existingProduct = await Product.findById(productId)
    .populate([
      { path: "shades" },
      {
        path: "category",
        select: "name category level parentCategory",
        populate: {
          path: "parentCategory",
          select: "name category level parentCategory",
          populate: { path: "parentCategory", select: "name category level" },
        },
      },
    ])
    .lean<PopulatedProduct>()
    .exec();

  if (!existingProduct) throw new AppError("Product not found", 404);

  const category_1 = categoryLevelOne
    ? await findOrCreateCategory(
        categoryLevelOne.name,
        categoryLevelOne.category,
        null,
        1
      )
    : existingProduct.category?.parentCategory?.parentCategory;

  if (!category_1) {
    throw new AppError("Category Level One not found", 404);
  }

  // Find or Create Level-Two Category (Parent must be Level-One)
  const category_2 = categoryLevelTwo
    ? await findOrCreateCategory(
        categoryLevelTwo.name,
        categoryLevelTwo.category,
        category_1._id,
        2
      )
    : existingProduct.category.parentCategory;

  if (!category_2) {
    throw new AppError("Category Level Two not found", 404);
  }

  // Find or Create Level-Three Category (Parent must be Level-Two)
  const category_3 = categoryLevelThree
    ? await findOrCreateCategory(
        categoryLevelThree.name,
        categoryLevelThree.category,
        category_2._id,
        3
      )
    : existingProduct.category;

  if (categoryLevelThree) {
    updateBody.category = category_3._id;
  }

  const files = req.files as Express.Multer.File[];

  const updatedCommonImageFiles: Express.Multer.File[] = [];
  let uploadedCommonImages: string[] = [];
  let uploadedNewShadesImages: string[] = [];
  let uploadedUpdatedShadesImages: string[] = [];
  let shadesTotalStock = existingProduct.totalStock;
  let newShadeIds: Types.ObjectId[] = [];

  let removedExistingShadesWithFileImages: string[] = [];
  let removedExistingShadesWithOutFileImages: string[] = [];

  const newShadeImagesMap: Record<number, Express.Multer.File[]> = {};
  const updatedShadeImagesMap: Record<number, Express.Multer.File[]> = {};
  files?.forEach((file) => {
    if (file.fieldname.startsWith("commonImages")) {
      updatedCommonImageFiles.push(file);
    } else {
      const newShadeMatch = file?.fieldname.match(
        /^newAddedShades\[(\d+)\]\[images\]/
      );
      const updatedShadeMatch = file?.fieldname.match(
        /^updatedShadeWithFiles\[(\d+)\]\[images\]/
      );

      if (newShadeMatch) {
        const shadeIndex = parseInt(newShadeMatch[1]);
        if (!newShadeImagesMap[shadeIndex]) {
          newShadeImagesMap[shadeIndex] = [];
        }
        newShadeImagesMap[shadeIndex].push(file);
      }
      if (updatedShadeMatch) {
        const shadeIndex = parseInt(updatedShadeMatch[1]);
        if (!updatedShadeImagesMap[shadeIndex]) {
          updatedShadeImagesMap[shadeIndex] = [];
        }
        updatedShadeImagesMap[shadeIndex].push(file);
      }
    }
  });

  // Upload common images
  if (updatedCommonImageFiles?.length) {
    const uploadedCommonImagesResult =
      await MediaModule.Utils.multipleImagesUploader({
        files: updatedCommonImageFiles,
        folder: `Products/${title ?? existingProduct.title}/Common_Images`,
        cloudinaryConfigOption: "product",
      });

    uploadedCommonImages = uploadedCommonImagesResult.map(
      (img) => img.secure_url
    );

    updateBody.commonImages = [
      ...uploadedCommonImages,
      ...existingProduct.commonImages.filter(
        (img) => !removingCommonImageURLs.includes(img)
      ),
    ];
  }

  // New Added Shades
  if (newAddedShades?.length) {
    try {
      const newShadesData = Array.isArray(newAddedShades)
        ? newAddedShades
        : [newAddedShades];

      const missingShadeErrors: string[] = [];

      newShadesData.forEach((shade, idx) => {
        if (!(newShadeImagesMap[idx] && newShadeImagesMap[idx].length > 0)) {
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
        newShadesData.map(async (shade, idx) => {
          const shadeFiles = newShadeImagesMap[idx] || [];

          shadesTotalStock += shade.stock;
          const uploadedShadeImagesResult =
            await MediaModule.Utils.multipleImagesUploader({
              files: shadeFiles,
              folder: `Products/${title ?? existingProduct.title}/Shades/${
                shade.shadeName
              }`,
              cloudinaryConfigOption: "product",
            });

          const images = uploadedShadeImagesResult.map((img) => img.secure_url);
          uploadedNewShadesImages.push(...images);

          return {
            ...shade,
            images,
          };
        })
      );

      newShadeIds = await Promise.all(
        enrichedShades.map(async (shade) => {
          const newShade = await Shade.create(shade);
          return new Types.ObjectId(newShade._id);
        })
      );

      updateBody.shades = [
        ...existingProduct.shades
          .filter(
            (sh) => sh._id && !removingShades?.includes(sh._id.toString())
          )
          .map((sh) => new Types.ObjectId(sh._id)),
        ...newShadeIds,
      ];
    } catch (error) {
      if (uploadedNewShadesImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedNewShadesImages,
          "product"
        );
      }
      if (uploadedCommonImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedCommonImages,
          "product"
        );
      }
      throw new AppError("Failed to create shades", 500);
    }
  }

  if (updatedShadeWithFiles?.length) {
    try {
      const updatedShadesData = Array.isArray(updatedShadeWithFiles)
        ? updatedShadeWithFiles
        : [updatedShadeWithFiles];

      const missingUpdatedShadeErrors: string[] = [];

      updatedShadesData.forEach((shade, idx) => {
        if (
          !(updatedShadeImagesMap[idx] && updatedShadeImagesMap[idx].length > 0)
        ) {
          const currentShade = existingProduct.shades.find(
            (sh) => sh?._id?.toString() === shade._id?.toString()
          );

          if (!currentShade) {
            throw new AppError(`Shade not found with id: ${shade._id}`, 404);
          }

          const shadeName = shade.shadeName ?? currentShade?.shadeName;
          missingUpdatedShadeErrors.push(
            `Shade: '${shadeName}' At least 1 image is required`
          );
        }
      });

      if (missingUpdatedShadeErrors.length > 0) {
        const errorMessage = missingUpdatedShadeErrors
          .map(
            (msg, i) =>
              `${
                missingUpdatedShadeErrors.length > 1 ? `${i + 1}). ` : ""
              }${msg}${i === missingUpdatedShadeErrors.length - 1 ? "." : ""}`
          )
          .join(", ");
        throw new AppError(errorMessage, 400);
      }

      const enrichedUpdatedShades = await Promise.all(
        updatedShadesData.map(async (shade, idx) => {
          const shadeFiles = updatedShadeImagesMap[idx] || [];
          const currentShade = existingProduct.shades.find(
            (sh) => sh?._id?.toString() === shade._id?.toString()
          );
          if (!currentShade) return;
          // totalStock += shade.stock;
          const uploadedShadeImagesResult =
            await MediaModule.Utils.multipleImagesUploader({
              files: shadeFiles,
              folder: `Products/${title || existingProduct.title}/Shades/${
                shade.shadeName || currentShade.shadeName
              }`,
              cloudinaryConfigOption: "product",
            });

          const images = uploadedShadeImagesResult.map((img) => img.secure_url);
          uploadedUpdatedShadesImages.push(...images);

          const currentShadeRemovingImages =
            removingShadeImageUrls?.find(
              (sh: { _id: string; urls: string[] }) =>
                sh._id.toString() === shade._id.toString()
            )?.urls || [];

          removedExistingShadesWithFileImages.push(
            ...currentShadeRemovingImages
          );

          const existingShadeImgUrls =
            currentShade.images.filter(
              (img) => !currentShadeRemovingImages.includes(img)
            ) || [];

          if (shade.stock) {
            shadesTotalStock +=
              shadesTotalStock - currentShade.stock + shade.stock;
          }

          return {
            ...shade,
            images: [...existingShadeImgUrls, ...images],
          };
        })
      );
      await Promise.all(
        enrichedUpdatedShades.map(async (shade) => {
          await Shade.findByIdAndUpdate(
            { _id: shade._id },
            { $set: { ...shade } }
          );
        })
      );
    } catch (error) {
      if (uploadedUpdatedShadesImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedUpdatedShadesImages,
          "product"
        );
      }
      if (uploadedNewShadesImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedNewShadesImages,
          "product"
        );
      }
      if (uploadedCommonImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedCommonImages,
          "product"
        );
      }
      if (newShadeIds.length) {
        await Shade.deleteMany({ _id: { $in: newShadeIds } });
      }

      throw error;
    }
  }

  if (updatedShadeWithoutFiles?.length) {
    try {
      await Promise.all(
        updatedShadeWithoutFiles.map(async (shade: Partial<ShadeProps>) => {
          const currentShade = existingProduct.shades.find(
            (sh) => sh?._id?.toString() === shade._id?.toString()
          );

          if (!currentShade) {
            throw new AppError(`Shade not found with id: ${shade._id}`, 404);
          }

          const currentShadeRemovingImages =
            removingShadeImageUrls?.find(
              (sh: { _id: string; urls: string[] }) =>
                sh._id.toString() === shade._id?.toString()
            )?.urls || [];

          removedExistingShadesWithOutFileImages.push(
            ...currentShadeRemovingImages
          );

          if (shade.stock) {
            shadesTotalStock +=
              shadesTotalStock - currentShade.stock + shade.stock;
          }

          await Shade.findByIdAndUpdate(
            { _id: shade._id },
            { $set: { ...shade } }
          );
        })
      );
    } catch (error) {
      if (uploadedUpdatedShadesImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedUpdatedShadesImages,
          "product"
        );
      }
      if (uploadedNewShadesImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedNewShadesImages,
          "product"
        );
      }
      if (uploadedCommonImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          uploadedCommonImages,
          "product"
        );
      }
      if (removedExistingShadesWithFileImages.length) {
        await MediaModule.Utils.multipleImagesRemover(
          removedExistingShadesWithFileImages,
          "product"
        );
      }
      if (newShadeIds.length) {
        await Shade.deleteMany({ _id: { $in: newShadeIds } });
      }
      throw error;
    }
  }

  try {
    if (totalStock ?? existingProduct.totalStock !== shadesTotalStock) {
      throw new AppError(
        "Total stock should be equal to sum of shades stock",
        400
      );
    }

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      updateBody,
      { new: true }
    );

    // Remove Shades
    let removedShadeImages: string[] = [];
    if (removingShades?.length) {
      const objectIds = removingShades.map(
        (id: string) => new Types.ObjectId(id)
      );

      // Fetch shades to be removed
      const shadesToDelete = await Shade.find({ _id: { $in: objectIds } });

      removedShadeImages =
        shadesToDelete.flatMap((shade) => shade.images) || [];
      await Shade.deleteMany({ _id: { $in: objectIds } });
    }

    res.success(200, "Product updated successfully", { product });
  } catch (error) {
    if (uploadedUpdatedShadesImages.length) {
      await MediaModule.Utils.multipleImagesRemover(
        uploadedUpdatedShadesImages,
        "product"
      );
    }
    if (uploadedNewShadesImages.length) {
      await MediaModule.Utils.multipleImagesRemover(
        uploadedNewShadesImages,
        "product"
      );
    }
    if (uploadedCommonImages.length) {
      await MediaModule.Utils.multipleImagesRemover(
        uploadedCommonImages,
        "product"
      );
    }
    if (removedExistingShadesWithFileImages.length) {
      await MediaModule.Utils.multipleImagesRemover(
        removedExistingShadesWithFileImages,
        "product"
      );
    }
    if (removedExistingShadesWithOutFileImages.length) {
      await MediaModule.Utils.multipleImagesRemover(
        removedExistingShadesWithOutFileImages,
        "product"
      );
    }
    if (newShadeIds.length) {
      await Shade.deleteMany({ _id: { $in: newShadeIds } });
    }
    throw error;
  }
};
