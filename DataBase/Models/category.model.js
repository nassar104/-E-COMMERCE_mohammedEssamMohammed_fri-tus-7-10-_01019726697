/**
 * schema to DB to do in data
 * model the format of the data
 * func set defult valu in slug
 * return schema category
 */
import slugify from "slugify";
import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;
const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            default: function () {
              return slugify(this.name, { lower: true, replacement: "_" });
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // TODO: Change to true after adding authentication
        },
        Images: {
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
        customId: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

export const Category = mongoose.models.Category || model("Category", categorySchema);
