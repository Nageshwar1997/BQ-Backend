import { Request, Response } from "express";
import { imageUploader } from "../../utils/mediaUploader";
import { AppError } from "../../constructors";

export const uploadProductController = async (req: Request, res: Response) => {
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
      levelOneCategory,
      levelTwoCategory,
      levelThreeCategory,
    } = body;

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
      shades.map(async (shade, idx) => {
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

    const finalData = {
      title,
      brand,
      description,
      howToUse,
      ingredients,
      additionalDetails,
      categoryLevelOne: levelOneCategory,
      categoryLevelTwo: levelTwoCategory,
      categoryLevelThree: levelThreeCategory,
      originalPrice: parseFloat(originalPrice),
      sellingPrice: parseFloat(sellingPrice),
      commonImages: uploadedCommonImages.map((img) => img.secure_url),
      shades: enrichedShades,
    };

    console.log("✅ Final Product Data");
    // console.dir(finalData, { depth: null });

    res.status(200).json({ message: "Product uploaded", data: finalData });
  } catch (error) {
    console.error("❌ Upload failed", error);
    const message =
      error instanceof AppError ? error.message : "Something went wrong";
    res.status(500).json({ error: message });
  }
};
