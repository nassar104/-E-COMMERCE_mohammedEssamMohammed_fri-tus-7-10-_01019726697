import { Router } from "express";
// model DataBase
import { Category } from "../../../DataBase/Models/index.js";
// controllers
import * as controller from "./categories.controller.js";
// utils
import { extensions } from "../../Utils/index.js";
// middlewares
import { errorHandler, getDocumentByName, multerHost } from "../../Middlewares/index.js";


const categoryRouter = Router();


// routes
categoryRouter.post(
    "/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(Category),
    errorHandler(controller.createCategory)
);

categoryRouter.get("/", errorHandler(controller.getCategory));

categoryRouter.put(
    "/update/:_id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(Category),
    errorHandler(controller.updateCategory)
);

categoryRouter.delete("/delete/:_id", errorHandler(controller.deleteCategory));

export { categoryRouter };