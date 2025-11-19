import { getEmbeddings } from "../../../configs";
import { EmbeddedProduct } from "../models";

export const getEmbeddedProducts = async (message: string) => {
  const queryVector = await getEmbeddings.embedQuery(message);

  const products = await EmbeddedProduct.aggregate([
    // Vector search
    {
      $vectorSearch: {
        index: "vector_product_index",
        queryVector,
        path: "embeddings",
        numCandidates: 100,
        limit: 5,
      },
    },

    // Lookup product
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productData",
      },
    },
    { $unwind: "$productData" },

    // Lookup shades
    {
      $lookup: {
        from: "shades",
        localField: "productData.shades",
        foreignField: "_id",
        as: "shadesData",
      },
    },

    // Lookup category
    {
      $lookup: {
        from: "categories",
        localField: "productData.category",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    { $unwind: "$categoryData" },

    // Parent category
    {
      $lookup: {
        from: "categories",
        localField: "categoryData.parentCategory",
        foreignField: "_id",
        as: "parentCategoryData",
      },
    },
    {
      $unwind: {
        path: "$parentCategoryData",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Grandparent category
    {
      $lookup: {
        from: "categories",
        localField: "parentCategoryData.parentCategory",
        foreignField: "_id",
        as: "grandParentCategoryData",
      },
    },
    {
      $unwind: {
        path: "$grandParentCategoryData",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Project required fields
    {
      $project: {
        _id: 0,
        similarityScore: 1,

        product: {
          title: "$productData.title",
          brand: "$productData.brand",
          sellingPrice: "$productData.sellingPrice",
          originalPrice: "$productData.originalPrice",
          discount: "$productData.discount",
          howToUse: "$productData.howToUse",
          ingredients: "$productData.ingredients",
          additionalDetails: "$productData.additionalDetails",

          // Shade Names Only (Array of Shade Names)
          shades: {
            $map: {
              input: "$productData.shades",
              as: "s",
              in: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$shadesData",
                          as: "sd",
                          cond: { $eq: ["$$sd._id", "$$s"] },
                        },
                      },
                      as: "matchedShade",
                      in: "$$matchedShade.shadeName",
                    },
                  },
                  0,
                ],
              },
            },
          },
          // Category Names Only
          category: {
            grandParent: "$grandParentCategoryData.name",
            parent: "$parentCategoryData.name",
            child: "$categoryData.name",
          },
        },
      },
    },
  ]);

  return products;
};
