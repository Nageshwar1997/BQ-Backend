import { Schema } from "mongoose";
import { ProductProps } from "../../types";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    // brand: { type: String, required: true, trim: true },
    // originalPrice: { type: Number, required: true, min: 0 },
    // sellingPrice: { type: Number, required: true, min: 0 },
    // discount: { type: Number, required: true, min: 0 },
    // description: { type: String, required: true, trim: true },
    // howToUse: { type: String, trim: true },
    // ingredients: { type: String, trim: true },
    // additionalDetails: { type: String, trim: true }, // Made optional
    // commonImages: {
    //   type: [String],
    //   required: true,
    //   validate: {
    //     validator: function (val: string[]) {
    //       return Array.isArray(val) && val.length > 0;
    //     },
    //     message: "At least one image is required",
    //   },
    // },
    // shades: [{ type: Schema.Types.ObjectId, ref: "Shade" }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    // seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // ratings: [{ type: Schema.Types.ObjectId, ref: "Rating" }],
    // reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // averageRating: { type: Number, default: 0 },
    // totalReviews: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Unique index for title
productSchema.index({ title: 1 }, { unique: true });

// Indexing for performance
productSchema.index({ category: 1 });
// productSchema.index({ seller: 1 });

// Middleware to auto-calculate discount before saving
// productSchema.pre("save", function (next) {
//   if (this.originalPrice > 0 && this.sellingPrice > 0) {
//     this.discount = Math.round(
//       ((this.originalPrice - this.sellingPrice) / this.originalPrice) * 100
//     );
//   }
//   next();
// });

export default productSchema;
