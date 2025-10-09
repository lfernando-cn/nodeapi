import { AppDataSource } from "./data-source"
import CreateSituationSeeds from "./seeds/CreateSituationSeeds";
import CreateProductSituationSeeds from "./seeds/CreateProductSituationSeeds";
import CreateProductCategorySeeds from "./seeds/CreateProductCategorySeeds";
import CreateProductSeeds from "./seeds/CreateProductSeeds";

const runSeeds = async() =>{
    console.log("Conectando ao banco de dados...")

    await AppDataSource.initialize();
    console.log("Banco de dados conectado! ")

    try{
        
       
        const situationsSeeds =  new CreateSituationSeeds(); 
        const productSituationSeeds = new CreateProductSituationSeeds();
        const productCategorySeeds = new CreateProductCategorySeeds();
        const productProductSeeds = new CreateProductSeeds();


        
        await  situationsSeeds.run(AppDataSource); 
        await productSituationSeeds.run(AppDataSource);
        await  productCategorySeeds.run(AppDataSource);
        await productProductSeeds.run(AppDataSource);

        console.log("Todas as Seeds foram executadas com sucesso!");

    }catch(error){

        console.log("Erro ao executar o seed: ", error);

    }finally{ 
        await AppDataSource.destroy();
        console.log("Conexão com o banco de dados encerrada.")
    }
};
runSeeds();