import { Router } from "express";
// models
import { Brand } from "../../../DataBase/Models/index.js";
// controllers
import * as controller from "./brands.controller.js";
// middlewares
import { errorHandler, getDocumentByName , multerHost }  from "../../Middlewares/index.js";
// utils
import { extensions } from "../../Utils/index.js";

const brandRouter = Router();

// Routers
brandRouter.post(
    "/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    errorHandler(controller.createBrand)
  );
brandRouter.get("/", errorHandler(controller.getBrands));
brandRouter.delete("/delete/:_id", errorHandler(controller.deleteBrand));

brandRouter.put(
    "/update/:_id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    errorHandler(controller.updatebrand)
  );





export { brandRouter };