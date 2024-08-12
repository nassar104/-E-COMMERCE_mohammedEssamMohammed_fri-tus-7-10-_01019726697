// models
import { Brand, Category, SubCategory } from "../../../DataBase/Models/index.js";

import slugify from "slugify";
import { nanoid } from "nanoid";
// utils
import { ErrorClass,cloudinaryConfig, uploadFile } from "../../Utils/index.js";

/**
 * @api {POST} Api /categories/create
 * categories
 * create new category
 */
export const createCategory = async (req, res, next) => {
    const { name } = req.body;
    // category slug do in DB as defult !?
    // Image is sended?
    if (!req.file) {
      return next(
        new ErrorClass("Please upload an image", 400, "Please upload an image")
      );
    }
    // upload the image to cloudinary
    const customId = nanoid(5);
  
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${customId}`,
    });
  
    // category object 
    const category = {
      name,
      Images: {
      secure_url,
      public_id,
      },
      customId,
    };
    const newCategory = await Category.create(category);
  
    // send the response
    res.status(201).json({
      status: "success",
      data: newCategory,
    });
  };
  

/**
 * @api {GET} Api /categories
 *  Get category by name or id or slug
 * if user dont send all category
 */
export const getCategory = async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};
  
    // Check what you sent user 
    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;
  
    const category = await Category.find(queryFilter);
  
    if (!category) {
      return next(
        new ErrorClass("Category not found", 404, "Category not found")
      );
    }

    // send the response
    res.status(200).json({
      status: "success",
      data: category,
    });
  };

  /**
 * @api {DELETE} Api /categories/delete/:_id
 * Delete a category & relivant
 */
export const deleteCategory = async (req, res, next) => {
    const { _id } = req.params;
  
    // delete the category from db
    const category = await Category.findByIdAndDelete(_id);
    if (!category) {
      return next(
        new ErrorClass("Category not found", 404, "Category not found")
      );
    }
  
    const deletedSubCategories = await SubCategory.deleteMany({categoryId: _id});

   // delete from cloudinary
   const categoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${category?.customId}`;
   await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
   await cloudinaryConfig().api.delete_folder(categoryPath);
 

    // check if subcategories are deleted already
    if (deletedSubCategories.deletedCount) {
      const deletedBrands = await Brand.deleteMany({ categoryId: _id });
      if (deletedBrands.deletedCount) {
        await Product.deleteMany({ categoryId: _id });
      }
    }

    // send the response
    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  };
  

  
/**
 * @api {PUT} /categories/update/:_id 
 *  Update a category
 * Check category and new data and seve Update
 */
export const updateCategory = async (req, res, next) => {
    const { _id } = req.params;

    const category = await Category.findById(_id);
    if (!category) {
      return next(
        new ErrorClass("Category not found", 404, "Category not found")
      );
    }

    // new data Update from body ==>File body
    const { name, public_id_new } = req.body;
  
    if (name) {
      const slug = slugify(name, {
        replacement: "_",
        lower: true,
      });
  
      category.name = name;
      category.slug = slug;
    }
  
    //new Image update from file
    if (req.file) {
      const splitedPublicId = public_id_new.split(`${category.customId}/`)[1];
  
      const { secure_url } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
        publicId: splitedPublicId,
      });
      category.Images.secure_url = secure_url;
    }
  
  

    await category.save();
  
    // send the response
    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: category,
    });
  };
  