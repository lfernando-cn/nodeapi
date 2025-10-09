import "reflect-metadata";
import { DataSource } from "typeorm";
import { Situation } from "./entity/Situation";
import { User } from "./entity/Users";
import { Product } from "./entity/Product";
import { ProductCategory } from "./entity/ProductCategory";
import { ProductSituation } from "./entity/ProductSituation";


import dotenv from "dotenv";


dotenv.config(); 

const dialect = process.env.DB_DIALECT ?? "mysql" ;

export const AppDataSource = new DataSource({
    type: dialect as "mysql"| "mariadb" | "postgres" | "mongodb",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT): 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: true,
    entities: [Situation, User, Product, ProductCategory, ProductSituation],
    subscribers: [],
    migrations: [__dirname + "/migration/*.js"], 
});


AppDataSource.initialize().then(()=>{
  console.log ("Conexão do banco de dados realizada com sucesso!")
}).catch((error)=>{
  console.log ("Erro na conexão com o banco de dados!", error)
})