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

const removeImages = async (imageUrls: string[]): Promise<void> => {
  if (imageUrls.length) {
    await MediaModule.Utils.multipleImagesRemover(imageUrls, "product");
  }
};

const uploadImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  if (files?.length) {
    const result = await MediaModule.Utils.multipleImagesUploader({
      files,
      folder,
      cloudinaryConfigOption: "product",
    });

    return result.map((img) => img.secure_url);
  }
  return [];
};

export const updateProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const { productId } = req.params;
  isValidMongoId(productId, "Invalid Product Id", 400);

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

  checkUserPermission({
    userId: req.user?._id as Types.ObjectId,
    checkId: existingProduct.seller,
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
    removedQuillImageURLs,
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
  let newShadeIds: string[] = [];

  let removedExistingShadesWithFileImages: string[] = [];
  let removedExistingShadesWithOutFileImages: string[] = [];
  let removedShadeImages: string[] = [];

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

  const existingShades: ShadeProps[] = existingProduct.shades;
  let oldShadesIds: string[] = [];

  if (existingShades?.length) {
    oldShadesIds = existingShades.map(
      (shade) => shade._id?.toString() as string
    );
  }

  // Upload common images
  if (updatedCommonImageFiles?.length) {
    uploadedCommonImages = await uploadImages(
      updatedCommonImageFiles,
      `Products/${title ?? existingProduct.title}/Common_Images`
    );

    updateBody.commonImages = [
      ...uploadedCommonImages,
      ...(existingProduct.commonImages.filter(
        (img) => !removingCommonImageURLs.includes(img)
      ) || []),
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
          const images = await uploadImages(
            shadeFiles,
            `Products/${title ?? existingProduct.title}/Shades/${
              shade.shadeName
            }`
          );
          uploadedNewShadesImages.push(...images);

          return { ...shade, images };
        })
      );

      newShadeIds = await Promise.all(
        enrichedShades?.map(async (shade) => {
          const newShade = await Shade.create(shade);
          return newShade._id.toString();
        })
      );
    } catch (error) {
      await removeImages([...uploadedNewShadesImages, ...uploadedCommonImages]);
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
          const currentShade = existingShades.find(
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
        updatedShadesData?.map(async (shade, idx) => {
          const shadeFiles = updatedShadeImagesMap[idx] || [];
          const currentShade = existingShades.find(
            (sh) => sh?._id?.toString() === shade._id?.toString()
          );
          if (!currentShade) return;
          const images = await uploadImages(
            shadeFiles,
            `Products/${title || existingProduct.title}/Shades/${
              shade.shadeName || currentShade.shadeName
            }`
          );
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
          ).lean();
        })
      );

      await removeImages(removedExistingShadesWithFileImages);
    } catch (error) {
      await removeImages([
        ...uploadedCommonImages,
        ...uploadedNewShadesImages,
        ...uploadedUpdatedShadesImages,
      ]);

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
          const currentShade = existingShades.find(
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

          await Shade.findByIdAndUpdate(
            { _id: shade._id },
            { $set: { ...shade } }
          ).lean();
        })
      );

      await removeImages(removedExistingShadesWithOutFileImages);
    } catch (error) {
      await removeImages([
        ...uploadedCommonImages,
        ...uploadedNewShadesImages,
        ...uploadedUpdatedShadesImages,
        ...removedExistingShadesWithFileImages,
      ]);
      if (newShadeIds.length) {
        await Shade.deleteMany({ _id: { $in: newShadeIds } });
      }
      throw error;
    }
  }

  if (removingShadeImageUrls?.length) {
    const onlyRemovedShadeImages = removingShadeImageUrls.flatMap(
      (sh: { urls: string[] }) => sh.urls
    );
    await removeImages(onlyRemovedShadeImages);
  }

  try {
    // Remove Shades
    let removingIds: string[] = [];
    if (removingShades?.length) {
      removingIds = removingShades.map((id: string) => id);

      // Fetch shades to be removed
      const shadesToDelete = await Shade.find({
        _id: { $in: removingIds },
      }).lean();

      removedShadeImages =
        shadesToDelete?.flatMap((shade) => shade.images) || [];
      await Shade.deleteMany({ _id: { $in: removingIds } });

      await removeImages(removedShadeImages);
    }

    const finalShadeIds: string[] = oldShadesIds.filter(
      (id) => id && !removingIds.includes(id)
    );

    if (newShadeIds.length) {
      finalShadeIds.push(...newShadeIds);
    }

    if (newShadeIds.length || removingShades?.length) {
      if (finalShadeIds.length) {
        updateBody.shades = finalShadeIds.map((id) => new Types.ObjectId(id));
      } else {
        updateBody.shades = [];
      }
    }

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      updateBody,
      { new: true }
    ).lean();

    if (removingCommonImageURLs?.length) {
      await removeImages(removingCommonImageURLs);
    }

    if (removedQuillImageURLs?.length) {
      await removeImages(removedQuillImageURLs);
    }
    res.success(200, "Product updated successfully", { product });
  } catch (error) {
    await removeImages([
      ...removedShadeImages,
      ...uploadedCommonImages,
      ...uploadedNewShadesImages,
      ...removedExistingShadesWithFileImages,
      ...removedExistingShadesWithOutFileImages,
    ]);
    if (newShadeIds.length) {
      await Shade.deleteMany({ _id: { $in: newShadeIds } });
    }
    throw error;
  }
};
