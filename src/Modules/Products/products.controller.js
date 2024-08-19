// models
import { Product } from "../../../DataBase/Models/index.js";
// utils
import {calculateProductPrice, cloudinaryConfig, ErrorClass, uploadFile} from "../../Utils/index.js";

import { nanoid } from "nanoid";
import slugify from "slugify";

/**
 * @api {post} API /products/create  
 * Create a new products
 * Return the result create products
 */
export const createProduct = async (req, res, next) => {
    const { title, overview, specs, price, discountAmount, discountType, stock } = req.body;
    const brandDocument = req.document;
    if (!req.files.length)
      return next(new ErrorClass("No images uploaded", { status: 400 }));
  
    
    // brandDocument
    const brandCustomId = brandDocument.customId;
    const catgeoryCustomId = brandDocument.categoryId.customId;
    const subCategoryCustomId = brandDocument.subCategoryId.customId;
  
     
    // upload to cloudinary
    const customId = nanoid(4);
    const folder = `${process.env.UPLOADS_FOLDER}/Categories/${catgeoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;
    const URLs = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder,
      });
      URLs.push({ secure_url, public_id });
    }
  
    const productObject = {
      title,
      overview,
      specs: JSON.parse(specs),
      price,
      appliedDiscount: {
        amount: discountAmount,
        type: discountType,
      },
      stock,
      Images: {
        URLs,
        customId,
      },
      categoryId: brandDocument.categoryId._id,
      subCategoryId: brandDocument.subCategoryId._id,
      brandId: brandDocument._id,
    };
  
    const newProduct = await Product.create(productObject);
    
    // send the response
    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  };
  

  /**
 * @api {DELETE} Api /products/delete/:_id
 * Delete a products
 */
  export const deleteProducts = async (req, res, next) => {
    const { _id } = req.params;
  
    const product = await Product.findByIdAndDelete(_id)
    .populate("categoryId")
    .populate("subCategoryId")
    .populate("brandId");
  if (!product) {
    return next(new ErrorClass("product not found", 404, "product not found"));
  }
  

    // delete the related image from cloudinary
    const productpath = `${process.env.UPLOADS_FOLDER}/Categories/${product.categoryId.customId}/SubCategories/${product.subCategoryId.customId}/Brands/${product.brandId.customId}/Products/${product?.Images.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(productpath);
    await cloudinaryConfig().api.delete_folder(productpath);

    // send the response
    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  };


 /**
 * @api {PUT} Product/update/:_id
 * Update a Product
 */
 export const updateProduct = async (req, res, next) => {
  const { productId } = req.params;

  const {title, stock, overview, badge, price,
    discountAmount, discountType, specs } = req.body;

   // check if the product is exist
  const product = await Product.findById(productId).populate("categoryId")
  .populate("subCategoryId")
  .populate("brandId");
  if (!product)
    return next(new ErrorClass("Product not found", { status: 404 }));

  // update title and slug
  if (title) {
    product.title = title;
    product.slug = slugify(title, {
      replacement: "_",
      lower: true,
    });
  }
  // update stock, overview, badge, specs
  if (stock) {product.stock = stock;}
  if (overview) {product.overview = overview;}
  if (badge) {product.badge = badge};
  if (specs) {
    product.specs = JSON.parse(specs)
  };

  // update price and discount
  if (price || discountAmount || discountType) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;

    product.appliedPrice = calculateProductPrice(newPrice, discount);

    product.price = newPrice;
    product.appliedDiscount = discount;
  }

  // update the product imge
    if (req.files) {
     // upload to cloudinary
     const productpath = `${process.env.UPLOADS_FOLDER}/Categories/${product.categoryId.customId}/SubCategories/${product.subCategoryId.customId}/Brands/${product.brandId.customId}/Products/${product?.Images.customId}`;
    //  await cloudinaryConfig().api.delete_resources_by_prefix(productpath);
     const URLs = [];

     for (const file of req.files) {
       const { secure_url, public_id } = await uploadFile({
         file: file.path,
         folder:productpath,
       });
       URLs.push({ secure_url, public_id });

     }
    product.Images.URLs = URLs

  };


  await product.save();

  // send the response
  res.status(200).json({
    status: "success",
    data: product,
  });
};




/**
 * @api {get} API /products/list
 * list all Products & Apply search filters
 */
export const listProducts = async (req, res, next) => {
  // find all products
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  const products = await Product.paginate(
    {appliedPrice: { $gte: 1000 } },
    {
      page,
      limit,
      skip,
      select: "-Images --spescs -categoryId -subCategoryId -brandId",
      sort: { appliedPrice: 1 },
    }
  );
  
  // send the response
  res.status(200).json({
    status: "success",
    data: products,
  });
};
