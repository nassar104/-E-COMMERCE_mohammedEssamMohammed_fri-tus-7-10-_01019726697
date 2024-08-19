import { Router } from "express";
// model DataBase
import { Product, Brand } from "../../../DataBase/Models/index.js";
// controllers
import * as controller from "./products.controller.js";
// utils
import { extensions } from "../../Utils/index.js";
// middlewares
import { checkIfIdsExit, errorHandler, multerHost } from "../../Middlewares/index.js";

const productRouter = Router();

// Routers
productRouter.post(
    "/create",
    multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
    checkIfIdsExit(Brand),
    errorHandler(controller.createProduct)
  );

  productRouter.delete("/delete/:_id", errorHandler(controller.deleteProducts));

  productRouter.put("/update/:productId",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 10),
 errorHandler(controller.updateProduct));

  productRouter.get("/list", errorHandler(controller.listProducts));


export { productRouter };