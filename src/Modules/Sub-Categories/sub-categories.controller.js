// models
import { Category, SubCategory, Brand } from "../../../DataBase/Models/index.js";
// utils
import { ErrorClass, cloudinaryConfig, uploadFile } from "../../Utils/index.js";

import slugify from "slugify";
import { nanoid } from "nanoid";



/**
 * @api {POST} API /sub-categories/create
 * create a  new subCategory
 * Return the result create subCategory
 */
export const createSubCategory = async (req, res, next) => {
    const category = await Category.findById(req.query.categoryId);
    if (!category) {
        return next(
            new ErrorClass("Category not found", 404, "Category not found")
        );
    }


    const { name } = req.body;
    // category slug do in DB as defult !?

    // Image
    if (!req.file) {
        return next(
            new ErrorClass("Please upload an image", 400, "Please upload an image")
        );
    }
    // upload to cloudinary
    const customId = nanoid(5);
    const { secure_url, public_id } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/SubCategories/${customId}`,
    });

    // prepare category object
    const subCategory = {
        name,
        Images: {
            secure_url,
            public_id,
        },
        customId,
        categoryId: category._id,
    };

    const newSubCategory = await SubCategory.create(subCategory);

    // send the response
    res.status(201).json({
        status: "success",
        data: newSubCategory,
    });
};
//********************** end sub-categories create  ***********************/


/**
 * @api {GET} Api /sub-categories 
 *  Get Sub Category by name or id or slug
 * if user dont send all Sub Category
 * Return the result GET subCategory
 */
export const getSubCategory = async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};

    // check if the query params are present
    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;

    const subCategory = await SubCategory.find(queryFilter);

    if (!subCategory) {
        return next(
            new ErrorClass("Category not found", 404, "Category not found")
        );
    }

    // send the response
    res.status(200).json({
        status: "success",
        data: subCategory,
    });
};
//********************** end sub-categories Get  ***********************/

/**
* @api {DELETE} Api /sub-categories/delete/:_id
*   Delete a Sub Category  & relivant
*   Return the result delete subCategory
*/
export const deleteSubCategory = async (req, res, next) => {
    const { _id } = req.params;

    // find the sub-category and delete
    const subCategory = await SubCategory.findByIdAndDelete(_id).populate(
        "categoryId"
    ).populate("categoryId");
    if (!subCategory) {
        return next(
            new ErrorClass("subCategory not found", 404, "subCategory not found")
        );
    }

    // delete the related image from cloudinary
    const subcategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`;    
    await cloudinaryConfig().api.delete_resources_by_prefix(subcategoryPath);
    await cloudinaryConfig().api.delete_folder(subcategoryPath);

    // delete the related brands 
    const deletedBrands = await Brand.deleteMany({ subCategoryId: subCategory._id });
    if (deletedBrands.deletedCount) {
        // In case all data is deleted from Brand delet the subCategory
        await Product.deleteMany({ subCategoryId: subCategory._id });
    }

    /**
     * @todo  delete the related products 
     */

    res.status(200).json({
        status: "success",
        message: "SubCategory deleted successfully",
    });
};
//********************** end sub-categories delete  ***********************/

/**
 * @api {PUT} Api /sub-categories/update/:_id
 * Update a sub-categories
 * Return the result Update subCategory
 */
export const updateSubCategory = async (req, res, next) => {
    // get the sub-category id
    const { _id } = req.params;
  
    // destructuring the request body
    const { name, public_id_new } = req.body;
  
    // find the sub-category by id
    const subCategory = await SubCategory.findById(_id).populate("categoryId");
    if (!subCategory) {
      return next(
        new ErrorClass("subCategory not found", 404, "subCategory not found")
      );
    }
  
    // Update name and slug
    if (name) {
      const slug = slugify(name, {
        replacement: "_",
        lower: true,
      });
  
      subCategory.name = name;
      subCategory.slug = slug;
    }
  
    //Update Image
    if (req.file) {
      const splitedPublicId = public_id_new.split(`${subCategory.customId}/`)[1];
  
      const { secure_url } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.category.customId}/SubCategories/${subCategory.customId}`,
        publicId: splitedPublicId,
      });
      subCategory.Images.secure_url = secure_url;
    }
  
    await subCategory.save();
  
    res.status(200).json({
      status: "success",
      message: "SubCategory updated successfully",
      data: subCategory,
    });
  };
  //********************** end sub-categories Update  ***********************/
