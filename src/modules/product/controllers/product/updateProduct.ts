import { Types } from "mongoose";
import { Response, NextFunction } from "express";
import { AuthorizedRequest } from "../../../../types";
import { Product, Shade } from "../../models";
import { AppError } from "../../../../classes";
import { MediaModule } from "../../..";
import { PopulatedProduct } from "../../types";
import { findOrCreateCategory } from "../../services";

export const updateProductController = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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
      removingCommonImageURLs,
      removingShadeImageUrls,
      categoryLevelOne,
      categoryLevelTwo,
      categoryLevelThree,
    } = req.body;

    const { productId } = req.params;

    const existingProduct = await Product.findById(productId)
      .populate([
        {
          path: "shades",
        },
        {
          path: "category",
          select: "name category level parentCategory",
          populate: {
            path: "parentCategory",
            select: "name category level parentCategory",
            populate: {
              path: "parentCategory",
              select: "name category level",
            },
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

    const files = req.files as Express.Multer.File[];

    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid Product ID", 400);
    }

    // ---------- HANDLE COMMON IMAGE UPLOAD/REMOVE ----------
    const commonImageFiles =
      files?.filter((f) => f.fieldname.startsWith("commonImages")) || [];

    const updatedCommonImages = [...(existingProduct.commonImages || [])];

    // Remove old URLs
    if (removingCommonImageURLs) {
      const removeList: string[] = removingCommonImageURLs;
      await MediaModule.Utils.multipleImagesRemover(removeList, "product");

      removeList.forEach((url) => {
        const index = updatedCommonImages.indexOf(url);
        if (index !== -1) updatedCommonImages.splice(index, 1);
      });
    }

    // Upload new files
    if (commonImageFiles.length > 0) {
      const uploaded = await MediaModule.Utils.multipleImagesUploader({
        files: commonImageFiles,
        folder: `Products/${title ?? existingProduct.title}/Common_Images`,
        cloudinaryConfigOption: "product",
      });
      updatedCommonImages.push(...uploaded.map((f) => f.secure_url));
    }

    // ---------- HANDLE SHADE IMAGE REMOVALS ----------
    if (removingShadeImageUrls) {
      const toRemove: { _id: string; urls: string[] }[] =
        removingShadeImageUrls;

      for (const item of toRemove) {
        await MediaModule.Utils.multipleImagesRemover(item.urls, "product");
        await Shade.findByIdAndUpdate(
          item._id,
          {
            $pull: { images: { $in: item.urls } },
          },
          { new: true }
        );
      }
    }

    console.log("REQ BODY", req.body);

    // ---------- HANDLE NEW SHADES ----------
    const newShades: any[] = [];
    Object.entries(req.body).forEach(([key, val]) => {
      const match = key.match(/^shades\[(\d+)]/);

      if (match) {
        const index = parseInt(match[1]);
        if (!newShades[index]) newShades[index] = {};
        const nestedKey = key.replace(/^shades\[\d+]\[(.+)]$/, "$1");
        newShades[index][nestedKey] = val;
      }
    });

    const shadeImageFilesMap: Record<number, Express.Multer.File[]> = {};
    files?.forEach((file) => {
      const match = file.fieldname.match(/^shades\[(\d+)]\[images]/);
      if (match) {
        const index = parseInt(match[1]);
        if (!shadeImageFilesMap[index]) shadeImageFilesMap[index] = [];
        shadeImageFilesMap[index].push(file);
      }
    });

    const newShadeIds: Types.ObjectId[] = [];
    let updatedTotalStock = totalStock || 0;

    for (const [index, shade] of newShades.entries()) {
      const images: string[] = [];
      const files = shadeImageFilesMap[index] || [];
      if (files.length) {
        const uploaded = await MediaModule.Utils.multipleImagesUploader({
          files,
          folder: `Products/${title ?? existingProduct.title}/Shades/${
            shade.shadeName
          }`,
          cloudinaryConfigOption: "product",
        });
        images.push(...uploaded.map((f) => f.secure_url));
      }

      console.log("FILES", files);

      const newShade = await Shade.create({
        ...shade,
        images,
        stock: Number(shade.stock),
      });

      updatedTotalStock += newShade.stock;

      console.log("newShade", newShade);
      newShadeIds.push(newShade._id as Types.ObjectId);
    }

    // ---------- HANDLE EXISTING SHADE UPDATES ----------
    const updatedWithFiles: any[] = [];
    const updatedWithoutFiles: any[] = [];

    Object.entries(req.body).forEach(([key, val]) => {
      const match = key.match(
        /^updated-with(?:out)?-files-shades\[(\d+)]\[(.+)]$/
      );
      if (match) {
        const [_, index, field] = match;
        const collection = key.includes("without-files")
          ? updatedWithoutFiles
          : updatedWithFiles;
        if (!collection[+index]) collection[+index] = {};
        collection[+index][field] = val;
      }
    });

    const updateShade = async (shade: any, hasFile: boolean) => {
      const images: string[] = [];
      const id = shade._id;
      if (hasFile && id) {
        const shadeFiles = files?.filter((f) =>
          f.fieldname.startsWith(
            `updated-with-files-shades[${updatedWithFiles.indexOf(
              shade
            )}][images]`
          )
        ) as Express.Multer.File[];
        if (shadeFiles?.length) {
          const uploaded = await MediaModule.Utils.multipleImagesUploader({
            files: shadeFiles,
            folder: `Products/${title}/Shades/${shade.shadeName}`,
            cloudinaryConfigOption: "product",
          });
          images.push(...uploaded.map((f) => f.secure_url));
        }
      }

      const updatedFields = {
        ...shade,
        ...(images.length && { $push: { images: { $each: images } } }),
      };

      await Shade.findByIdAndUpdate(id, updatedFields);
    };

    for (const shade of updatedWithFiles) await updateShade(shade, true);
    for (const shade of updatedWithoutFiles) await updateShade(shade, false);

    // ---------- UPDATE PRODUCT ----------
    const updateFields: any = {
      title,
      brand,
      originalPrice,
      sellingPrice,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      totalStock: updatedTotalStock,
      commonImages: updatedCommonImages,
      category: category_3._id,
    };

    if (newShadeIds.length) {
      updateFields.shades = [
        ...(existingProduct.shades?.map((s) => s._id) || []),
        ...newShadeIds,
      ];
    }

    updateFields.discount =
      originalPrice && sellingPrice
        ? ((originalPrice - sellingPrice) / originalPrice) * 100
        : existingProduct.discount;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateFields,
      { new: true }
    );

    res.success(200, "Product updated successfully", {
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
