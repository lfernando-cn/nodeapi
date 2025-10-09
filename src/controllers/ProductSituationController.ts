// importar a biblioteca do Express
import express, {Request, Response} from "express";
import { AppDataSource } from "../data-source";
import { ProductSituation } from "../entity/ProductSituation";
import { PaginationService } from "../services/PaginationServices"; //Confirmar se posso usar a mesma pagina Service


//Criar a aplicação Express
const router = express.Router();


// Criar a Lista
router.get("/product_situations",async(req:Request, res:Response)=>{
  try{

    //Obter o repositório da entidade Product
    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    //Receber o número da página e definir página 1 como padrão
    const page = Number(req.query.page) || 1;

    //Definir o limite de registros por página
    const limite = Number(req.query.limite) || 10;


    // Serviço de Paginação
    const result = await PaginationService.paginate(productSituationRepository, page, limite, {id: "DESC"});

    //Retornar a resposta com os dados e informações da paginação
    res.status(200).json(result); //Lista todos os dados do banco
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Listar as situações de produtos!",
      });
      return
  }
});

// Criar a Visualização do item cadastrado em situação
router.get("/product_situations/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    const productSituation = await productSituationRepository.findOneBy({id : parseInt(id)})

    if(!productSituation){
      res.status(404).json({
        message : "Situação de Produto não encontrada!",
      });
      return

    }

    res.status(200).json(productSituation); //Lista todos os dados do banco
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Visualizar as situações de produtos!",
      });
      return
  }
});



// Cadastra item no banco de dados
router.post("/product_situations",async(req:Request, res:Response)=>{

    try{
      var data = req.body;

      const productSituationRepository = AppDataSource.getRepository(ProductSituation)
      const newProductSituation = productSituationRepository.create(data);

      await productSituationRepository.save(newProductSituation); //Isso que irá salvar no banco de dados

      res.status(201).json({
        message : "Situação de Produto cadastrado com sucesso!",
        situation: newProductSituation,
      });

    }catch(error){

       res.status(500).json({
        message : "Erro ao cadastrar a situação de produto!",
      });

    }
});

// Faz a atualização do item cadastrado 
router.put("/product_situations/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    var data = req.body;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    const productSituation = await productSituationRepository.findOneBy({id : parseInt(id)}) //Busca pelo ID digitado

    if(!productSituation){ //Se passar um ID que não exite ele passa a seguinte mensagem
      res.status(404).json({
        message : "Situação de Produto não encontrada!",
      });
      return
    }

    //Atualiza os dados
    productSituationRepository.merge(productSituation, data);

    //Salvar as alterações de dados
    const updateProductSituation = await productSituationRepository.save(productSituation);

    res.status(200).json({
      messagem: "Situação de Produto atualizado com sucesso!",
      product: updateProductSituation,
    }); 
    

  }catch(error){
    res.status(500).json({
        message : "Erro ao Atualizar a situação de produto!",
      });
      return
  }
});

// Remove o item cadastrado no banco de dados
router.delete("/product_situations/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    const productSituation = await productSituationRepository.findOneBy({id : parseInt(id)}) //Busca pelo ID digitado

    if(!productSituation){ //Se passar um ID que não exite ele passa a seguinte mensagem
      res.status(404).json({
        message : "Situaçaõ de Produto não encontrado!",
      });
      return
    }

    //Remove os dados no banco
    await productSituationRepository.remove(productSituation);

    res.status(200).json({
      messagem: "Situação de Produto foi removido com sucesso!",
    }); 
    

  }catch(error){
    res.status(500).json({
        message : "Erro ao Atualizar a situação de produto!",
      });
      return
  }
});


//Exportar a instrução da rota
export default router