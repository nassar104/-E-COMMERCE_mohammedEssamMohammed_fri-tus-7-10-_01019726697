// models
import { Product } from "../../../DataBase/Models/index.js";
// utils
import {calculateProductPrice, ErrorClass, uploadFile} from "../../Utils/index.js";

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
  

