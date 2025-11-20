import { HumanMessage, initChatModel } from "langchain";
import { getEmbeddings, postEmbeddings } from "../../../configs";
import { EmbeddedProduct } from "../models";
import {
  IAggregatedEmbeddedProduct,
  IProductChatSession,
  TCreateOrUpdateEmbeddedProduct,
} from "../types";

const removeHTMLTags = (text: string): string => {
  return text
    ?.replace(/<[^>]*>/g, " ")
    ?.replace(/\s+/g, " ")
    ?.trim();
};

export const getEmbeddedProducts = async (
  message: string
): Promise<IAggregatedEmbeddedProduct[]> => {
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

  const cleanedProducts = products.map((item) => {
    return {
      ...item,
      product: {
        ...item.product,
        description: removeHTMLTags(item.product.description),
        howToUse: removeHTMLTags(item.product.howToUse),
        ingredients: removeHTMLTags(item.product.ingredients),
        additionalDetails: removeHTMLTags(item.product.additionalDetails),
      },
    };
  });

  return cleanedProducts;
};

export const getMinimalProductsForAiPrompt = (
  products: IAggregatedEmbeddedProduct[]
) => {
  const minimalProducts = products?.map(({ product }, i) => ({
    "Product No.": i + 1,
    Name: product.title,
    Brand: product.brand,
    "Selling Price": product.sellingPrice,
    "Original Price": product.sellingPrice,
    Description: product.description,
    Discount: product.discount,
    Category: {
      "Grand Parent": product.category.grandParent,
      Parent: product.category.parent,
      Child: product.category.child,
    },
    ...(product.howToUse && { "How To Use": product.howToUse }),
    ...(product.ingredients && {
      Ingredients: product.ingredients,
    }),
    ...(product.additionalDetails && {
      "Additional Details": product.additionalDetails,
    }),
    ...(product.shades.length > 0 && {
      Shades: product.shades.map((shadeName) => shadeName).join(", "),
    }),
  }));

  return minimalProducts;
};

export const createOrUpdateEmbeddedProduct = async ({
  title,
  brand,
  productId,
  category,
}: TCreateOrUpdateEmbeddedProduct) => {
  try {
    const searchText = `${title} ${brand} ${category.grandParent} ${category.parent} ${category.child}`;
    const embeddings = await postEmbeddings.embedQuery(searchText);

    await EmbeddedProduct.findOneAndUpdate(
      { product: productId },
      { $set: { embeddings, searchText } },
      { new: true, upsert: true }
    );

    console.log("Background product embedding done");
  } catch (err) {
    console.error("Background product embedding failed:", err);
  }
};

export const getAiGeneratedSuggestedQuestion = async (
  lastResponse: string,
  history: IProductChatSession["history"][]
): Promise<string[]> => {
  try {
    const model = await initChatModel("mistral-small-latest", {
      modelProvider: "mistralai",
      modelName: "mistral-small-latest",
      disableStreaming: true, // non-streaming for suggested questions
    });

    const prompt = `
      Based on the following AI assistant response, suggest 1-3 short, product-related follow-up questions that the user could ask next.
      Response: ${lastResponse}
      Format: Return only an array of questions in JSON.
    `;

    // Use invoke to get a single response chunk
    const aiOutput = await model.invoke([...history, new HumanMessage(prompt)]);

    let content = aiOutput.content ?? "";

    // Remove ```json and ``` if present
    content = content
      ?.replace(/```json/g, "")
      ?.replace(/```/g, "")
      ?.trim();

    // Try to parse JSON array
    try {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: split by newlines and remove empty lines
      return content
        ?.split("\n")
        ?.map((line: string) => line.trim())
        ?.filter((line: string) => line.length > 0);
    }

    return [];
  } catch (err) {
    console.log("Failed to generate suggested questions:", err);
    return [];
  }
};
