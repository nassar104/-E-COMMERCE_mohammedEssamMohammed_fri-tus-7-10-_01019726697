import slugify from "slugify";
import { nanoid } from "nanoid";
// models
import { SubCategory, Brand, Product } from "../../../DataBase/Models/index.js";
// uitls
import { cloudinaryConfig, ErrorClass, uploadFile } from "../../Utils/index.js";


/**
 * @api {post} Api /brands/create
 * Create a new brand
 * Return the result create brand
 */
export const createBrand = async (req, res, next) => {
    const { category, subCategory} = req.query;
    const { name } = req.body;

    const isSubcategoryExist = await SubCategory.findOne({
      _id: subCategory,
      categoryId: category,
    }).populate("categoryId");
  
    if (!isSubcategoryExist) {
      return next(
        new ErrorClass("Subcategory not found", 404, "Subcategory not found")
      );
    } 
  
    // Image
    if (!req.file) {
      return next(
        new ErrorClass("Please upload an image", 400, "Please upload an image")
      );
    }
    
    // upload the image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${isSubcategoryExist.categoryId.customId}/SubCategories/${isSubcategoryExist.customId}/Brands/${customId}`,
    });
  
    // prepare brand object
    const brand = {
      name,
      logo: {
        secure_url,
        public_id,
      },
      customId,
      categoryId: isSubcategoryExist.categoryId._id,
      subCategoryId: isSubcategoryExist._id,
    };

    const newBrand = await Brand.create(brand);

    // send the response
    res.status(201).json({
      status: "success",
      data: newBrand,
    });
  };
  

/**
 * @api {GET} /brands/Get
 * Get Sub Brand by name or id or slug
 * if user dont send all Sub Brand
 * Return the result GET subBrand
 */
export const getBrands = async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};

    // check if the query params are present
    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;

    const brand = await Brand.find(queryFilter);
  
    if (!brand) {
      return next(new ErrorClass("brand not found", 404, "brand not found"));
    }

    // send the response
    res.status(200).json({
      status: "success",
      data: brand,
    });
  };
  

  /**
 * @api {DELETE} /brands/delete/:_id  Delete a brand
 */
export const deleteBrand = async (req, res, next) => {
    const { _id } = req.params;
  
    // find the brand by id
    const brand = await Brand.findByIdAndDelete(_id)
      .populate("categoryId")
      .populate("subCategoryId");
    if (!brand) {
      return next(new ErrorClass("brand not found", 404, "brand not found"));
    }
    
    await Product.deleteMany({ brandId: brand._id });

    // delete the related image from cloudinary
    const brandPath = `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    await cloudinaryConfig().api.delete_folder(brandPath);
  
    // send the response
    res.status(200).json({
      status: "success",
      message: "brand deleted successfully",
    });
  };
  

/**
 * @api {PUT} brands/update/:_id  Update a category
 */
export const updatebrand = async (req, res, next) => {
    const { _id } = req.params;
    const { name } = req.body;
  
    // find the brand id
    const brand = await Brand.findById(_id)
      .populate("categoryId")
      .populate("subCategoryId");

    if (!brand) {
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
      brand.name = name;
      brand.slug = slug;
    }
  
    //Update Image
    if (req.file) {
      const splitedPublicId = brand.logo.public_id.split(`${brand.customId}/`)[1];
      const { secure_url } = await uploadFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`,
        publicId: splitedPublicId,
      });
      brand.logo.secure_url = secure_url;
    }
  
    await brand.save();
  
    // send the response
    res.status(200).json({
      status: "success",
      data: brand,
    });
  };