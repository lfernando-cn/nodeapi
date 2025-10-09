// importar a biblioteca do Express
import express, {Request, Response} from "express";
import { AppDataSource } from "../data-source";
import { ProductCategory } from "../entity/ProductCategory";
import { PaginationService } from "../services/PaginationServices"; //Confirmar se posso usar a mesma pagina Service


//Criar a aplicação Express
const router = express.Router();


// Criar a Lista
router.get("/productCategory",async(req:Request, res:Response)=>{
  try{

    //Obter o repositório da entidade Product
    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    //Receber o número da página e definir página 1 como padrão
    const page = Number(req.query.page) || 1;

    //Definir o limite de registros por página
    const limite = Number(req.query.limite) || 10;


    // Serviço de Paginação
    const result = await PaginationService.paginate(productCategoryRepository, page, limite, {id: "DESC"});

    //Retornar a resposta com os dados e informações da paginação
    res.status(200).json(result); //Lista todos os dados do banco
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Listar os produtos!",
      });
      return
  }
});

// Criar a Visualização do item cadastrado em situação
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

    res.status(200).json(productCategory); //Lista todos os dados do banco
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Visualizar os produtos!",
      });
      return
  }
});

// Cadastra item no banco de dados
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

// Faz a atualização do item cadastrado 
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

    //Atualiza os dados
    productCategoryRepository.merge(productCategory, data);

    //Salvar as alterações de dados
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

// Remove o item cadastrado no banco de dados
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

    //Remove os dados no banco
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