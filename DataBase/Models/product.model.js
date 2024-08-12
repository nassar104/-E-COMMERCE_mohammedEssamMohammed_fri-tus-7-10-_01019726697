/**
 * schema to DB to do in data
 * model the format of the data
 * func set defult valu in slug
 * return schema product
 */
// global setup
import mongoose from "../global-setup.js";
// utils
import { Badges, DiscountType, calculateProductPrice} from "../../src/Utils/index.js";
import slugify from "slugify";

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    // Strings Section
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      default: function () {
        return slugify(this.title, { lower: true, replacement: "_" });
      },
    },
    overview: String,
    specs: Object, 
    badge: {
      type: String,
      enum: Object.values(Badges),
    },

    // Numbers Section
    price: {
      type: Number,
      required: true,
      min: 10,
    },
    appliedDiscount: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      type: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE,
      },
    },
    appliedPrice: {
      type: Number,
      required: true,
      default: function () {
        return calculateProductPrice(this.price, this.appliedDiscount);
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 10,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    Images: {
      URLs: [
        {
          secure_url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
            unique: true,
          },
        },
      ],
      customId: {
        type: String,
        required: true,
        unique: true,
      },
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
       required: false, // TODO: Change to true after adding authentication 
    },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || model("Product", productSchema);
