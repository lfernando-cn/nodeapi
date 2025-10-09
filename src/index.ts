import express from "express";
import dotenv from "dotenv";


dotenv.config()
const app = express()
app.use(express.json());


//Incluir os controlleres
import SituationsController from "./controllers/SituationsController";
import ProductController from "./controllers/ProductController";
import ProductSituationController from "./controllers/ProductSituationController";
import ProductCategoryController from "./controllers/ProductCategoryController";


//Criar as rotas
app.use("/", SituationsController)
app.use("/", ProductController)
app.use ("/", ProductCategoryController)
app.use ("/", ProductSituationController)


//Iniciar o servidor 
app.listen(process.env.PORT,() => {
    console.log(`Servidor iniciado na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
})