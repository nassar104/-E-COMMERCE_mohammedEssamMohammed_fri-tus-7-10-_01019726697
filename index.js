import express from "express";
import { config } from "dotenv";
import { connection_db } from "./DataBase/connection.js";

import {globaleResponse}from "./src/Middlewares/index.js";
import * as router from "./src/Modules/index.js";


config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// mine routers
app.use("/categories", router.categoryRouter);
app.use("/sub-categories", router.subCategoryRouter);
app.use("/brands", router.brandRouter);
app.use("/products", router.productRouter);



// errorHandler top view
app.use(globaleResponse);
// Database conect
connection_db();
// send the response and listening
app.get("/", (req, res) => res.send("Hello to nassar stoor!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

