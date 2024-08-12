import { Mongoose } from "mongoose";
import { ErrorClass } from "../Utils/index.js";

/**
 * @param {Mongoose.model} model 
 * @returns {Function} 
 */
export const getDocumentByName = (model) => {
  return async (req, res, next) => {
    const { name } = req.body;
    if (name) {
      const document = await model.findOne({ name });
      if (document) {
        return next(
          new ErrorClass(
            `${model.modelName} Document not found`,
            404,
            `${model.modelName} Document not found`
          )
        );
      }
    }
    next();
  };
};

/**
 *
 * @param {Mongoose.model} model
 * @returns {Function} 
 */
export const checkIfIdsExit = (model) => {
  return async (req, res, next) => {
    const { category, subCategory, brand } = req.query;
    // Ids check
    const document = await model
      .findOne({
        _id: brand,
        categoryId: category,
        subCategoryId: subCategory,
      })
      .populate([
        { path: "categoryId", select: "customId" },
        { path: "subCategoryId", select: "customId" },
      ]);
    if (!document)
      return next(
        new ErrorClass(`${model.modelName} is not found`, { status: 404 })
      );

    req.document = document;
    next();
  };
};
