// importar a biblioteca do Express
import express, {Request, Response} from "express";
import { AppDataSource } from "../data-source";
import { ProductCategory } from "../entity/ProductCategory";
import { PaginationService } from "../services/PaginationServices"; //Confirmar se posso usar a mesma pagina Service



const router = express.Router();



router.get("/productCategory",async(req:Request, res:Response)=>{
  try{

    
    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    const page = Number(req.query.page) || 1;

    const limite = Number(req.query.limite) || 10;


    const result = await PaginationService.paginate(productCategoryRepository, page, limite, {id: "DESC"});

    
    res.status(200).json(result); 
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Listar os produtos!",
      });
      return
  }
});


router.get("/productCategory/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    const productCategory = await productCategoryRepository.findOneBy({id : parseInt(id)})

    if(!productCategory){
      res.status(404).json({
        message : "Produto não encontrada!",
      });
      return

    }

    res.status(200).json(productCategory); 
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Visualizar os produtos!",
      });
      return
  }
});


router.post("/productCategory",async(req:Request, res:Response)=>{

    try{
      var data = req.body;

      const productCategoryRepository = AppDataSource.getRepository(ProductCategory)
      const newProductCategory = productCategoryRepository.create(data);

      await productCategoryRepository.save(newProductCategory); //Isso que irá salvar no banco de dados

      res.status(201).json({
        message : "Produto cadastrado com sucesso!",
        situation: newProductCategory,
      });

    }catch(error){

       res.status(500).json({
        message : "Erro ao cadastrar a produto!",
      });

    }
});

router.put("/productCategory/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    var data = req.body;

    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    const productCategory = await productCategoryRepository.findOneBy({id : parseInt(id)}) //Busca pelo ID digitado

    if(!productCategory){ //Se passar um ID que não exite ele passa a seguinte mensagem
      res.status(404).json({
        message : "Produto não encontrada!",
      });
      return
    }

    productCategoryRepository.merge(productCategory, data);

    const updateProductCategory = await productCategoryRepository.save(productCategory);

    res.status(200).json({
      messagem: "Produto atualizado com sucesso!",
      product: updateProductCategory,
    }); 
    

  }catch(error){
    res.status(500).json({
        message : "Erro ao Atualizar o produto!",
      });
      return
  }
});

router.delete("/productCategory/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    const productCategory = await productCategoryRepository.findOneBy({id : parseInt(id)}) //Busca pelo ID digitado

    if(!productCategory){ //Se passar um ID que não exite ele passa a seguinte mensagem
      res.status(404).json({
        message : "Produto não encontrado!",
      });
      return
    }

    await productCategoryRepository.remove(productCategory);

    res.status(200).json({
      messagem: "Produto foi removido com sucesso!",
    }); 
    

  }catch(error){
    res.status(500).json({
        message : "Erro ao Atualizar o produto!",
      });
      return
  }
});


//Exportar a instrução da rota
export default router