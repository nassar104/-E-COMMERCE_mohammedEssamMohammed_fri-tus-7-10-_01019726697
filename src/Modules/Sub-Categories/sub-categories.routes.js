import { Router } from "express";
// models
import { SubCategory } from "../../../DataBase/Models/index.js";
// controllers
import * as controller from "./sub-categories.controller.js";
// middlewares
import { errorHandler, getDocumentByName , multerHost }  from "../../Middlewares/index.js";
// utils
import { extensions } from "../../Utils/index.js";

const subCategoryRouter = Router();


// Routers
subCategoryRouter.post(
    "/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(SubCategory),
    errorHandler(controller.createSubCategory)
  );

subCategoryRouter.get("/", errorHandler(controller.getSubCategory));

subCategoryRouter.delete("/delete/:_id", errorHandler(controller.deleteSubCategory));

subCategoryRouter.put(
    "/update/:_id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(SubCategory),
    errorHandler(controller.updateSubCategory)
  );
export { subCategoryRouter };